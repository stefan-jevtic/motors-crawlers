require('../../common/config')

const Promise = require('bluebird')
const ListingQueue = require('../../models/sql').listing_queue;
const ListingSvc = require('../../services/mobile-de.svc/listing.svc');
const Queue = require('promise-queue')
const AlertSvc = require('../../services/alert.svc/slack.svc')
const sequelize = require('../../models/sql').sequelize

Queue.configure(Promise); // setup Bluebird promise in Promise Queue

var queueConcurrency = parseInt(process.env.LISTING_MAX_CONCURRENCY)
var queueLimit = 1 // parseInt(process.env.MAX_COMPETITOR_QUEUE)
var queueInterval = parseInt(process.env.LISTING_INTERVAL)

const queue = new Queue(queueConcurrency, queueLimit)

function pop(num){
    return sequelize.query("SELECT * FROM listing_queue WHERE spider=:spider AND (finished_at IS NULL OR finished_at<(NOW() - INTERVAL 3 DAY)) AND num_failures<5 ORDER BY finished_at ASC LIMIT 1"+num,
    { replacements: { spider: 'mobilede'}, type: sequelize.QueryTypes.SELECT } )
}

function push(jobId, newData){
    return ListingQueue.update(newData, {
        where: {
            id: jobId
        }
    })
}

process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled Rejection: ', reason);
    if(_.isObject(reason) && reason.message){
        AlertSvc.notify('Motors Listing Worker Unhandled Rejection: '+reason.message);
    } else {
        AlertSvc.notify('Motors Listing Worker Unhandled Rejection: '+reason);
    }
    // application specific logging, throwing an error, or other logic here
    process.exit(1);
});

const options = {}

async function singleJobWork(job) {
    // work in series
    return ListingSvc.process(job, function(newData){
        return push(job.id, newData)
    }, options)
    .then(function(res){
        logger.info('Mobile.de Listing job finished ', job.id)
        AlertSvc.notify('Mobile.de Listing job finished: '+job.id)
        return push(job.id, {
            num_failures: 0,
            last_page: 0,
            finished_at: new Date(),
            run_sequence_id: job.run_sequence_id+1
        })
    })
    .catch(function(e){
        logger.error(e)
        AlertSvc.notify('Mobile.de Listing job error: '+job.id+': '+e.message)
        if(job.num_failures<5){
            return push(job.id, {
                num_failures: job.num_failures+1
            })
        } else {
            logger.warn('Mobile.de Listing Job '+job.id+ ' skipped for too many failures')
            AlertSvc.notify('Mobile.de Listing job error: '+job.id+': skipped for too many failure')
            return push(job.id, {
                num_failures: job.num_failures+1
            })
        }
    })
}

async function loop() {
    // pop N urls
    var queueCapacity = queueLimit - queue.getQueueLength();
    if(queueCapacity<=0){
        logger.debug('Queue full - wait')
        return Promise.delay(5000)
        .then(function(){
            return loop()
        })
    }

    const jobs = await pop(queueCapacity)
    
    if(jobs.length==0){
        //logger.debug('No events, wait 10 seconds')
        return Promise.delay(10000)
        .then(function(){
            return loop()
        })
    }

    for(var i=0; i<jobs.length; i++){
        queue.add(function () {
            return singleJobWork(jobs[i]);
        })
    }

    logger.debug('Queued '+jobs.length+' items')

    return Promise.delay(queueInterval)
    .then(function(){
        return loop()
    })
}

return Promise.resolve().then(loop);
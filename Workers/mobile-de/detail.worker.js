//require('../../common/config');

const Promise = require('bluebird');
const DetailQueue = require('../../Models/').detail_queue;
const DetailSvc = require('../../Scrapers/mobilede/detail');
const Queue = require('promise-queue');
//const AlertSvc = require('../../services/alert.svc/slack.svc');
const sequelize = require('../../Models/index').sequelize;

Queue.configure(Promise); // setup Bluebird promise in Promise Queue

var queueConcurrency = parseInt(process.env.DETAIL_MAX_CONCURRENCY);
var queueInterval = parseInt(process.env.DETAIL_INTERVAL);
var queueLimit = 1; // parseInt(process.env.MAX_COMPETITOR_QUEUE)




console.log(queueConcurrency,queueInterval);

const queue = new Queue(queueConcurrency, queueLimit);

function pop(num){
    return sequelize.query("SELECT * FROM detail_queue WHERE spider=:spider AND finished_at IS NULL AND num_failures<5 LIMIT 1"+num,
    { replacements: { spider: 'mobile-de'}, type: sequelize.QueryTypes.SELECT } )
}



function push(jobId, newData){
    return DetailQueue.update(newData, {
        where: {
            id: jobId
        }
    })
}

// process.on('unhandledRejection', (reason) => {
//     //logger.error('Unhandled Rejection: ', reason);
//     if(_.isObject(reason) && reason.message){
//       //  AlertSvc.notify('Motors Detail Worker Unhandled Rejection: '+reason.message);
//     } else {
//      //   AlertSvc.notify('Motors Detail Worker Unhandled Rejection: '+reason);
//     }
//     // application specific logging, throwing an error, or other logic here
//     process.exit(1);
// });

const options = {

}

async function singleJobWork(job) {
    // work in series
    return DetailSvc.process(job, options)
    .then(function(res){
        logger.info('Mobile.de Detail job finished ', job.id)
     //   AlertSvc.notify('Mobile.de Detail job finished: '+job.id)
        return push(job.id, {
            finished_at: new Date(),
            run_sequence_id: job.run_sequence_id+1
        })
    })
    .catch(function(e){
        logger.error(e)
      //  AlertSvc.notify('Mobile.de Detail job error: '+job.id+': '+e.message)
        if(job.num_failures<5){
            return push(job.id, {
                num_failures: job.num_failures+1
            })
        } else {
            logger.warn('Mobile.de Detail Job '+job.id+ ' skipped for too many failures')
       //     AlertSvc.notify('Mobile.de Detail job error: '+job.id+': skipped for too many failure')
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
        logger.debug('Queue full - wait');
        return Promise.delay(5000)
        .then(function(){
            return loop()
        })
    }

    const jobs = await pop(queueCapacity);
    
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
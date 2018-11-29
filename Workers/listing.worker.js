const Queue = require('promise-queue');
const sequelize = require('../Models/index').sequelize;

class ListingWorker {

    constructor(spider, engine){
        this.queueConcurrency = parseInt(process.env.LISTING_MAX_CONCURRENCY);
        this.queueInterval = parseInt(process.env.LISTING_INTERVAL);
        this.queueLimit = parseInt(process.env.LISTING_MAX_COMPETITOR_QUEUE);
        const Listing = require(`../Scrapers/${spider}/listing`);
        this.test = new Listing(engine);
        this.spider = spider;
        this.dq = require('../Models/index').listing_queue;
        Queue.configure(Promise);
        this.queue = new Queue(this.queueConcurrency, this.queueLimit)
    }

    async pop(num){
        const q = `SELECT * FROM listing_queue WHERE spider=:spider AND ((status='READY' AND num_failures<5 AND (finished_at IS NULL OR finished_at<(NOW() - INTERVAL 3 DAY))) OR (status='RESERVED' AND reserved_at<(NOW() - INTERVAL 15 MINUTE) AND num_failures<5)) ORDER BY finished_at ASC LIMIT ${num}`
        const job = await sequelize.query(q, {
            replacements: { spider: this.spider},
            type: sequelize.QueryTypes.SELECT
        })

        if(job.length){
            for(let x = 0; x < job.length; x++){
                await this.push(job[x].id, {
                    reserved_at: new Date(),
                    status: 'RESERVED'
                })
            }
        }
        else
            global.loger.info('No more jobs to do. Retrying for 5 seconds...')
        return job
    }

    push(jobId, data){
        return this.dq.update(data, {
            where: {
                id: jobId
            }
        })
    }

    singleJob(job){
        return new Promise((resolve, reject) => {
            this.test.Run(job)
                .then(async () => {
                    await this.push(job.id, {
                        finished_at: new Date(),
                        num_failures: 0,
                        status: 'READY',
                        run_sequence_id: job.run_sequence_id+1,
                        last_page: 0
                    })

                    global.loger.info(`${this.spider} listing job finished ${job.id}`)
                    global.AlertSvc(`${this.spider} listing job finished ${job.id}`)
                    resolve()
                })
                .catch(async err => {
                    global.loger.error(err)
                    global.AlertSvc(`${this.spider} listing job error ${job.id}: ${err.message}`)
                    if(job.num_failures < 5){
                        await this.push(job.id, {
                            status: 'READY',
                            num_failures: job.num_failures+1
                        })
                        reject(err)
                    }
                    else {
                        global.loger.warn(`${this.spider} listing job: ${job.id} skipped for too many failures`)
                        global.AlertSvc(`${this.spider} listing job: ${job.id} skipped for too many failures`)
                        await this.push(job.id, {
                            status: 'READY',
                            num_failures: job.num_failures+1
                        })
                        reject(err)
                    }
                })
        })
    }

    crawl(){
        let that = this, jobs = [];
        (async function loop(i) {
            const queueCapacity = that.queueLimit - (that.queue.getQueueLength()+that.queue.getPendingLength());
            if(queueCapacity > 0 && jobs.length < that.queueLimit){
                let set = await that.pop(queueCapacity);
                if(set.length === 0){
                    await that.delay(5000)
                    return loop(i)
                }
                jobs.push(...set)
            }
            if(jobs[0] === undefined){
                await that.delay(1000)
                global.loger.debug(`Waiting for a free spot to get new jobs...`)
                return loop(i)
            }
            const job = jobs[0]
            if(queueCapacity <= 0){
                global.loger.debug(`queue full --> waiting....`)
                await that.delay(2000)
                return loop(i)
            }
            that.queue.add(async () => {
                await that.singleJob(job)
                    .catch(err => console.log(err))
            })
            jobs.splice(0, 1)
            global.loger.debug(`Currently working: ${that.queue.pendingPromises}/${that.queue.maxPendingPromises}; Queued: ${that.queue.getQueueLength()}/${that.queue.maxQueuedPromises}`)
            return loop(++i)
        })(0)
    }

    delay(ms){
        return new Promise((resolve, reject) => setTimeout(resolve, ms))
    }
}

module.exports = ListingWorker;
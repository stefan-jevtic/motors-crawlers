const Queue = require('promise-queue');
const sequelize = require('../Models/index').sequelize;

class ListingWorker {

    constructor(spider, engine){
        this.queueConcurrency = parseInt(process.env.DETAIL_MAX_CONCURRENCY);
        this.queueInterval = parseInt(process.env.DETAIL_INTERVAL);
        this.queueLimit = parseInt(process.env.MAX_COMPETITOR_QUEUE);
        const Listing = require(`../Scrapers/${spider}/listing`);
        this.test = new Listing(engine);
        this.spider = spider;
        this.dq = require('../Models/index').listing_queue;
        Queue.configure(Promise);
        this.queue = new Queue(this.queueConcurrency, this.queueLimit);
        this.counter = 0
    }

    pop(num){
        const q = `SELECT * FROM listing_queue WHERE spider=:spider AND (finished_at IS NULL OR finished_at<(NOW() - INTERVAL 3 DAY)) AND num_failures < 5 LIMIT 3`;
        return sequelize.query(q, {
            replacements: { spider: this.spider},
            type: sequelize.QueryTypes.SELECT
        })
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
                     run_sequence_id: job.run_sequence_id+1
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
                            num_failures: job.num_failures+1
                        })
                        reject(err)
                    }
                    else {
                        global.loger.warn(`${this.spider} listing job: ${job.id} skipped for too many failures`)
                        global.AlertSvc(`${this.spider} listing job: ${job.id} skipped for too many failures`)
                        await this.push(job.id, {
                            num_failures: job.num_failures+1
                        })
                        reject(err)
                    }
                })
        })
    }

    async crawl(){
        /**
         * todo: Uncomment code below if you want to test for 2 * x records
         * */
        // if(++this.counter > 2){
        //     console.log('Finished');
        //     return false;
        // }
        global.loger.info(`================> Getting new set of jobs <================`)
        const jobs = await this.pop(0), that = this;
        if(jobs.length === 0){
            global.loger.info(`Finished.`)
            return false;
        }
        (async function loop(i) {
            if(jobs[i] === undefined){
                if(that.queue.pendingPromises === 0){
                    global.loger.info(`All finished, return`)
                    return that.crawl()
                }
                else {
                    await that.delay(1000)
                    global.loger.debug(`Waiting for all jobs finish...`)
                    return loop(i)
                }
            }
            const job = jobs[i]
            const queueCapacity = that.queueLimit - that.queue.getQueueLength()
            if(queueCapacity <= 0){
                global.loger.debug(`queue full --> waiting....`)
                await that.delay(2000)
                return loop(i)
            }
            that.queue.add(async () => {
                await that.singleJob(job)
                    .catch(err => console.log(err))
            })
            global.loger.debug(`Currently working: ${that.queue.pendingPromises}/${that.queue.maxPendingPromises}; Queued: ${that.queue.getQueueLength()}/${that.queue.maxQueuedPromises}`)
            return loop(++i)
        })(0)
    }

    delay(ms){
        return new Promise((resolve, reject) => setTimeout(resolve, ms))
    }
}

module.exports = ListingWorker;
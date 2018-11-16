const Queue = require('promise-queue');
const sequelize = require('../Models/index').sequelize;

class DetailWorker {

    constructor(spider, engine){
        this.queueConcurrency = parseInt(process.env.DETAIL_MAX_CONCURRENCY);
        this.queueInterval = parseInt(process.env.DETAIL_INTERVAL);
        this.queueLimit = parseInt(process.env.MAX_COMPETITOR_QUEUE);
        const Detail = require(`../Scrapers/${spider}/detail`);
        this.test = new Detail(engine);
        this.spider = spider;
        this.dq = require('../Models/index').detail_queue;
        Queue.configure(Promise);
        this.queue = new Queue(this.queueConcurrency, this.queueLimit)
    }

    async pop(num){
        const q = `SELECT * FROM detail_queue WHERE spider=:spider AND ((status='READY' AND num_failures<5 AND finished_at IS NULL) OR (status='RESERVED' AND reserved_at<(NOW() - INTERVAL 15 MINUTE) AND num_failures<5)) LIMIT 1`
        const job = await sequelize.query(q, {
            replacements: { spider: this.spider},
            type: sequelize.QueryTypes.SELECT
        })

        if(job.length){
            this.push(job[0].id, {
                reserved_at: new Date(),
                status: 'RESERVED'
            })
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
        return new Promise(async (resolve, reject) => {
            this.test.Run(job)
                .then(async () => {
                    await this.push(job.id, {
                        status: 'READY',
                        num_failures: 0,
                        finished_at: new Date(),
                    })
                    global.AlertSvc(`${this.spider} detail job finished ${job.id}`)
                    global.loger.info(`${this.spider} detail job finished ${job.id}`)
                    resolve()
                })
                .catch(async err => {
                    global.loger.error(err)
                    global.AlertSvc(`${this.spider} detail job error ${job.id}: ${err.message}`)
                    if(job.num_failures < 5){
                        await this.push(job.id, {
                            status: 'READY',
                            num_failures: job.num_failures+1
                        })
                        reject(err)
                    }
                    else {
                        global.loger.warn(`${this.spider} detail job: ${job.id} skipped for too many failures`)
                        global.AlertSvc(`${this.spider} detail job: ${job.id} skipped for too many failures`)
                        await this.push(job.id, {
                            status: 'READY',
                            num_failures: job.num_failures+1
                        })
                        reject(err)
                    }
                })
        })
    }

    async crawl(){
        global.loger.info(`================> Getting new set of jobs <================`)
        const jobs = await this.pop(0), that = this;
        if(jobs.length === 0){
            await this.delay(5000)
            return this.crawl()
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

module.exports = DetailWorker;
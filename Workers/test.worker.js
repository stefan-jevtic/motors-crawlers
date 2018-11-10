const Test = require('../Scrapers/Test');
const Detail = require('../Scrapers/mobile-de/detail');
const Queue = require('promise-queue');
const sequelize = require('../Models/index').sequelize;

class TestWorker {

    constructor(spider, engine){
        this.queueConcurrency = 1; //parseInt(process.env.DETAIL_MAX_CONCURRENCY);
        this.queueInterval = 5000; //parseInt(process.env.DETAIL_INTERVAL);
        this.queueLimit = 1; // parseInt(process.env.MAX_COMPETITOR_QUEUE)
        this.test = new Detail(engine);
        this.spider = spider;
        this.dq = require('../Models/index').detail_queue;
        Queue.configure(Promise);
        this.queue = new Queue(this.queueConcurrency, this.queueLimit)
        this.counter = 0
    }

    pop(num){
        const q = `SELECT * FROM detail_queue WHERE spider=:spider AND (finished_at IS NULL OR finished_at<(NOW() - INTERVAL 3 DAY)) AND num_failures < 5 LIMIT 3`
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
        return new Promise(async (resolve, reject) => {
            await this.test.Run(job)
                .catch(async err => {
                    console.error(err)
                    if(job.num_failures < 5){
                        await this.push(job.id, {
                            num_failures: job.num_failures+1
                        })
                        reject(err)
                    }
                    else {
                        await this.push(job.id, {
                            num_failures: job.num_failures+1
                        })
                        console.warn(`Mobile.de Detail Job ${job.id} skipped for too many failures`)
                        reject(err)
                    }
                })
            await this.push(job.id, {
                finished_at: new Date(),
                run_sequence_id: job.run_sequence_id+1
            })

            console.log(`Mobile.de detail job finished ${job.id}`)
            resolve()
        })

    }

    async crawl(){
        /**
         * todo: Uncomment code below if you want to test for 2 * 10 records
         * */
        if(++this.counter > 2){
            console.log('Finished');
            return false;
        }
        console.log('================> Getting new set of jobs <================')
        const jobs = await this.pop(0), that = this;
        if(jobs.length === 0)
            return false;
        (async function loop(i) {
            if(jobs[i] === undefined){
                if(that.queue.pendingPromises === 0){
                    console.log('All finished, return')
                    return that.crawl()
                }
                else {
                    await that.delay(1000)
                    console.log('Waiting for all jobs finish...')
                    return loop(i)
                }
            }
            const job = jobs[i]
            const queueCapacity = that.queueLimit - that.queue.getQueueLength()
            if(queueCapacity <= 0){
                console.warn('queue full --> waiting....')
                await that.delay(2000)
                return loop(i)
            }
            that.queue.add(async () => {
                await that.singleJob(job)
                    .catch(err => console.log(err))
            })
            console.log(`Currently working: ${that.queue.pendingPromises}/${that.queue.maxPendingPromises}; Queued: ${that.queue.getQueueLength()}/${that.queue.maxQueuedPromises}`)
            return loop(++i)
        })(0)
    }

    delay(ms){
        return new Promise((resolve, reject) => setTimeout(resolve, ms))
    }
}

module.exports = TestWorker;
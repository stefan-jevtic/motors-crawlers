const Engine = require('../Server/Engine/Engine')
const cheerio = require('cheerio')

class Test {
    constructor(type){
        this.type = type
    }

    Run(job){
        return new Promise(async (resolve, reject) => {
            try {
                const engine = new Engine(this.type)
                const response = await engine.get(job.start_url, {})
                    .catch(err => {
                        reject(err)
                    })
                let body = cheerio.load(response.html)
                console.log(`Scraping job with id: ${job.id}...`)
                setTimeout(() => {
                    engine.close()
                    resolve()
                }, 3000)
            }
            catch (e) {
                reject(e)
            }
        })
    }
}

module.exports = Test
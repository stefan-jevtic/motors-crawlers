/**
 * todo: Add options for engine type.
 * todo: Add UserAgents and Proxies
 * todo: Add error handling and logger 
 * todo: Add static meethod post
 * */

const autoloader = require('auto-loader');

class Engine {

    constructor(type){
        if(!type)
            throw new Error('Type of engine is not passed! Aborting.');
        if(type !== 'Request' && type !== 'Chrome')
            throw new Error('Wrong engine type! Available: Request or Chrome. Aborting.')
        this.type = type;
    }

    initialize(options){
        return new Promise(async (resolve, reject) => {
            const SearchEngine = autoloader.load(__dirname)[this.type];
            this.request = new SearchEngine(options);
            await this.request.init()
                .catch(err => reject(err));
            console.log('Successfully initialized search engine.');
            resolve()
        })
    }

    get(url, options){
        return new Promise(async (resolve, reject) => {

            this.request.goto(url, options, (err, res) => {
                if(err)
                    reject(err);
                resolve(res)
            })
        })
    }

    close(){
        this.request.end()
    }

}

module.exports = Engine;

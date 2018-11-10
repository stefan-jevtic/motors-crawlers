/**
 * todo: error handling in logger
 * */

const autoloader = require('auto-loader');
const UserAgents = require('./UserAgents');

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

    static create(type, options){
        return new Promise(async(resolve, reject) => {
            options.UserAgent = UserAgents[Math.floor(Math.random() * UserAgents.length)];
            const i = new Engine(type)
            await i.initialize(options)
                .catch(err => reject(err))
            resolve(i)
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
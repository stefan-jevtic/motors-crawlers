const puppeteer = require('puppeteer');

class Chrome{

    constructor(options){
        this.width = 'width' in options ? options.width : 1366;
        this.height = 'heigth' in options ? options.heigth : 766;
        this.timeout = 'timeout' in options ? options.timeout : 30000;
        this.waitUntil = 'waitUntil' in options ? options.waitUntil : 'load';
        this.UserAgent = options.UserAgent;
        this.path = __dirname+'/../../Utils/AntiCaptcha/';
        this.headless = process.env.HEADLESS === 'true' ? true : false
    }

    init(){
        return new Promise(async (resolve, reject) => {
            await this.OpenBrowser()
                .catch(err => reject(err))
            resolve()
        })
    }

    OpenBrowser(){
        return new Promise(async (resolve, reject) => {
            let args = [
                '--ignore-certificate-errors',
                '--no-sandbox',
                '--disable-setuid-sandbox',
                //   '--disable-translate',
                //  '--disable-extensions',
                //   '--disable-sync'
                '--disable-extensions-except='+this.path+'',
                '--load-extension='+this.path+''
            ]
            if(process.env.PROXY_SERVER)
                args.push(`--proxy-server=${process.env.PROXY_SERVER}`)
            const browser = await puppeteer.launch({
                ignoreHTTPSErrors:true,
                args:args,
                headless:this.headless,
            })
                .catch(err => {
                    console.error(err);
                    reject(err)
                });
            this.Browser = browser;
            this.Page = await browser.newPage().catch(err => reject(err));

            if(process.env.PROXY_SERVER){
                switch (process.env.PROXY_AUTH) {
                    case 'crawlera':
                        await this.Page.setExtraHTTPHeaders({
                            'Proxy-Authorization': 'Basic ' + Buffer.from(process.env.PROXY_KEY).toString('base64')
                        });
                        break;
                    case 'basic':
                        await this.Page.authenticate({ username: process.env.PROXY_USERNAME, password: process.env.PROXY_PASSWORD });
                        break;
                    default:
                        break;
                }
            }

            if(process.env.INTERCEPT_REQUEST === 'true'){
                await this.Page.setRequestInterception(true)
                this.Page.on('request', req => {
                    if (['image', 'stylesheet', 'font'].indexOf(req.resourceType()) !== -1)
                        req.abort();
                    else
                        req.continue();
                })
            }

            await this.Page.setViewport({width: this.width, height: this.height}).catch(err => reject(err));
            await this.Page.setUserAgent(this.UserAgent).catch(err => reject(err));
            resolve(this.Page);
        })
    }

    CloseBrowser(){
        return new Promise(async (resolve, reject) => {
            await this.Page.close().catch(err => reject(err));
            await this.Browser.close().catch(err => reject(err));
            resolve();
        })
    }

    goto(url, options, callback){
        if(!url)
            return callback(new Error('Url not passed!'), null);
        let that = this;

        if(!this.Page){
            return callback(new Error('Browser is terminated!'), null);
        }

        let err_msg='';

        (async function loop(i) {

            if(i > parseInt(process.env.REPEAT_NETWORK_ERR)){
                return callback(new Error(`Engine failed ${process.env.REPEAT_NETWORK_ERR} times to get response!`), null);
            }

            try{

                let response = await that.Page.goto(url, {
                    'timeout':that.timeout,
                    waitUntil:that.waitUntil
                })


                let headers = response['_headers'];
                let statusCode = response['_status']+'';
                let requestedUrl = response['_url'];
                let bodyHTML = await that.Page.evaluate(() => document.documentElement.outerHTML)
                    .catch(err => {
                        return callback(err, null)
                    });

                if(statusCode.startsWith('4')){
                    if(statusCode === 403){
                        throw new Error('403-repeat');
                    }
                }

                if(statusCode.startsWith('5')){
                    console.log('status code is 5xx !!!!!!!', statusCode);
                    throw new Error(statusCode);
                }

                return callback(null,{
                    'html':bodyHTML,
                    'headers':headers,
                    'statusCode':statusCode,
                    'requestedUrl':requestedUrl,

                });

            }catch (err){
                console.log(err);
                err_msg=err.stack;
                if(err.stack.indexOf('Error: Navigation Timeout Exceeded')>-1){
                    err_msg='Error: Navigation Timeout Exceeded';
                }else if(err.stack.indexOf('Error: net::ERR_TUNNEL_CONNECTION_FAILED')>-1){
                    err_msg='Error: net::ERR_TUNNEL_CONNECTION_FAILED';
                }else if(err.stack.indexOf('403-repeat')>-1){
                    err_msg='403-repeat';
                }else if(err.stack.indexOf('Error: net::ERR_TOO_MANY_REDIRECTS')>-1){
                    err_msg='Error: net::ERR_TOO_MANY_REDIRECTS';
                    return loop(100);
                }else if(err.stack.indexOf('Error: net::ERR_INVALID_REDIRECT')>-1){
                    err_msg='Error: net::ERR_INVALID_REDIRECT';
                    return loop(100);
                }else if(err.stack.indexOf('Error: net::ERR_EMPTY_RESPONSE')>-1){
                    err_msg='Error: net::ERR_EMPTY_RESPONSE';
                    console.log(err_msg,'Browser is in sleep mode!!!!')
                    await that.delay(10000)
                    return loop(++i)
                }else if(err.stack.indexOf('Error: net::ERR_CONNECTION_CLOSED')>-1){
                    err_msg='Error: net::ERR_CONNECTION_CLOSED';
                    console.log(err_msg,'Browser is in sleep mode!!!!')
                    await that.delay(10000)
                    return loop(++i)
                }else if(err.stack.indexOf('Skip')>-1){
                    err_msg='Skip';
                    return loop(100);
                }
                else if(err.stack.indexOf('Session closed. Most likely the page has been closed.') > -1){
                    err_msg='Session closed. Most likely the page has been closed.';
                    return loop(++i);
                }

                await that.CloseBrowser()
                    .then(() => console.log('Browser closed in loop, repeating...'))
                    .catch(err => console.log('Failed to close browser in loop.'));
                that.Page = await that.OpenBrowser()
                    .catch(err => {
                        console.error(err)
                        return loop(100)
                    })
                return loop(++i);
            }
        }(0));
    }

    delay(secs){
        return new Promise((resolve, reject) => setTimeout(resolve, secs))
    }

    end(){
        this.CloseBrowser()
            .then(() => console.log('Browser closed. Crawler finished.'))
            .catch(err => console.log('Failed to close browser.'))
    }
}



module.exports = Chrome;
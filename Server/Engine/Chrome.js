const puppeteer = require('puppeteer');

class Chrome{

    constructor(options){
        this.options = options
        this.path = '/home/kica/.config/chromium/Default/Extensions/lncaoejhfdpcafpkkcddpjnhnodcajfg/0.3003_0'
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
            const browser = await puppeteer.launch({
                args:[
                    // '--proxy-server=',
                    '--ignore-certificate-errors',
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--load-extension='+this.path+'',
                    '--disable-extensions-except='+this.path+'',
                    //   '--disable-translate',
                    //  '--disable-extensions',
                    //   '--disable-sync'
                ],
                headless:false,
                'ignoreHTTPSErrors':true,
            })
                .catch(err => {
                    console.error(err);
                    reject(err)
                });
            this.Browser = browser;
            this.Page = await browser.newPage().catch(err => reject(err));
            // await this.Page.authenticate({ username:this.username, password:this.password }).catch(err => reject(err));
            await this.Page.setViewport({width: 1366, height: 768}).catch(err => reject(err));
            // await this.Page.setUserAgent(randomUserAgents).catch(err => reject(err));
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

            if(i > 10){
                await that.CloseBrowser();
                return callback(new Error('Engine failed 10 times to get response!'), null);
            }

            try{

                let response = await that.Page.goto(url, {
                    'timeout':that.timeout,
                    waitUntil:'networkidle0'
                }).catch(err => {
                    return callback(err, null)
                });


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
                    setTimeout(function(){
                        return loop(++i);
                    },20000);
                    return false;
                }else if(err.stack.indexOf('Error: net::ERR_CONNECTION_CLOSED')>-1){
                    err_msg='Error: net::ERR_CONNECTION_CLOSED';
                    console.log(err_msg,'Browser is in sleep mode!!!!')
                    setTimeout(function(){
                        return loop(++i);
                    },20000);
                    return false;
                }else if(err.stack.indexOf('Skip')>-1){
                    err_msg='Skip';
                    return loop(100);
                }
                else if(err.stack.indexOf('Session closed. Most likely the page has been closed.') > -1){
                    err_msg='Session closed. Most likely the page has been closed.';
                    return loop(++i);
                }

                await that.CloseBrowser();
                that.Page = await that.OpenBrowser()
                    .catch(err => {
                        console.error(err)
                        return loop(100)
                    })
                return loop(++i);
            }
        }(0));
    }

    end(){
        this.CloseBrowser()
            .then(() => console.log('Browser closed. Crawler finished.'))
            .catch(err => console.log('Failed to close browser.'))
    }
}



module.exports = Chrome;
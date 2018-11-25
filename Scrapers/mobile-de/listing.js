const mobilede = require('./mobilede');
const Engine = require('../../Server/Engine/Engine')
const Query = require('../../Server/DB/DB')

class Listing extends mobilede {

    constructor(type) {
        super();
        this.cheerio = require('cheerio');
        this.DB = new Query();
        this.type = type;
    }

    Run(job) {
        return new Promise(async (resolve, reject) => {
            let that = this, url;
            let links = [];
            let latest_page = parseInt(job.last_page)
            if(latest_page > 0)
                job.start_url = job.start_url.replace(/maxPowerAsArray=[A-z]+&minPowerAsArray=[A-z]+/g, `pageNumber=${latest_page + 1}`)
            links.push(job.start_url);
            const engine = await Engine.create(this.type, this.EngineOptions)
                .catch(err => {
                    console.error(err, 'Failed to initialize search engine. Aborting.');
                    return reject(err)
                });

            (async function loop(i) {
                if(links[i] === undefined){
                    engine.close();
                    return resolve()
                }
                let url = links[i];
                engine.get(url, {})
                    .then(async response => {
                        try {
                            let $ = that.cheerio.load(response.html);
                            let scope = url.split('scopeId=')[1].split('&')[0];
                            let usage = url.split('usage=')[1].split('&')[0];
                            let country_code = url.split('cn=')[1].split('&')[0];
                            let brand_code = url.split('makeModelVariant1.makeId=')[1].split('&')[0];
                            let brand = await that.DB.getBrand(that.source_id,brand_code);
                            let run_sequence_id = job.run_sequence_id;
                            let url_obj = {
                                'condition': usage,
                                'country_code': country_code,
                                'brand': brand_code,
                                'brand_id': brand,
                                'scope': scope,
                                'source_id':that.source_id,
                                'origin_url':url,
                                'run_sequence_id':run_sequence_id
                            }
                            if($('.pagination span.rbt-page-forward').length)
                                links.push($('.pagination span.rbt-page-forward').attr('data-href'))
                            if($('title').text().indexOf('Are you a human')>-1){
                                global.loger.warn('CAPTCHA OCCURS!')
                                global.loger.debug('Solving captcha...')
                                await engine.request.Page.waitForSelector('div.antigate_solver.recaptcha.solved',{'timeout':200000});
                                await engine.request.Page.click('.btn.btn--orange.u-full-width');
                                await engine.request.Page.waitForNavigation({'timeout':90000});
                                global.loger.debug('CAPTCHA SOLVED, CONTINUING...')
                                const cookies = await engine.request.Page.cookies()
                                await engine.request.Page.setCookie(...cookies)
                                let Body  = await engine.request.Page.content();
                                $ = that.cheerio.load(Body);
                                if($('.pagination span.rbt-page-forward').length)
                                    links.push($('.pagination span.rbt-page-forward').attr('data-href'))
                                that.ParsePage($, url_obj,url, async function (err,status) {
                                    if(err)
                                        throw err
                                    await that.DB.updateLastPage(job.id, ++latest_page);
                                    return loop(++i);
                                })
                            }else{
                                that.ParsePage($, url_obj,url, async function (err,status) {
                                    if(err)
                                        throw err
                                    await that.DB.updateLastPage(job.id, ++latest_page);
                                    return loop(++i);
                                })
                            }
                        }
                        catch (e) {
                            console.error(e)
                            engine.close()
                            return reject(e)
                        }
                    })
                    .catch(err => {
                        engine.close()
                        return reject(err)
                    })
            })(0)
        })
    }

    ParsePage($,url_obj,origin_url,callback) {
        let offer_id,url,price_net,price_gross,hasOfferPrice,vat,that=this,items=[];
        let element = $('a.result-item');
        try{

            let pom ={};
            for(let i =0;i<element.length;i++){
                offer_id = $(element[i]).attr('data-ad-id');
                url = 'https://suchen.mobile.de/fahrzeuge/details.html?id='+offer_id+'&lang=en';
                hasOfferPrice = $(element[i]).find('.price-block span.h2.u-text-line-through').text();
                if(!hasOfferPrice){
                    price_net =  $(element[i]).find('a.result-item span.u-block').eq(0).text().replace(/[^0-9\,]/gi, '');
                    if(price_net)price_net=price_net.replace(',','');
                    price_gross = $(element[i]).find('a.result-item span.u-block').eq(1).text().replace(/[^0-9\,]/gi, '');
                    if(price_gross)
                        price_gross=price_gross.replace(',','');
                    else
                        price_gross=null;
                    vat = $(element[i]).find('a.result-item span.u-block').eq(2).text().replace(/[^0-9\,]/gi, '');
                    if(vat)vat=
                        vat.replace(',','');
                    else
                        vat=null;
                }else{
                    price_net =  $(element[i]).find('a.result-item span.u-block').eq(1).text().replace(/[^0-9\,]/gi, '');
                    if(price_net)price_net=price_net.replace(',','');
                    price_gross = $(element[i]).find('a.result-item span.u-block').eq(2).text().replace(/[^0-9\,]/gi, '');
                    if(price_gross)price_gross=price_gross.replace(',','');
                    vat = $(element[i]).find('a.result-item span.u-block').eq(3).text().replace(/[^0-9\,]/gi, '');
                    if(vat)vat=vat.replace(',','');
                }
                url_obj['offer_id']= offer_id;
                url_obj['price_net']= price_net;
                url_obj['price_gross']= price_gross;
                url_obj['vat']= vat;
                url_obj['currency']= 'EUR';
                url_obj['url'] = url;
                pom = Object.assign({}, url_obj);
                items.push(pom);

            }
            that.SaveInfo(items,that.name,origin_url);
            return callback(null, 'done')


        }
        catch(e){
            console.log(e);
            return callback(e, null)
        }
    }

    SaveInfo(info,name,origin_url) {
        let that=this;
        that.DB.insertListing(info,name,origin_url);
    }
}

module.exports=Listing;
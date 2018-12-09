const Autoru = require('./autoru');
const Engine = require('../../Server/Engine/Engine')
const Query = require('../../Server/DB/DB')

class Listing extends Autoru {

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
            let latest_page = parseInt(job.last_page);
            if(latest_page > 0)
                job.start_url = job.start_url.replace('output_type=list&', `output_type=list&pageNumber=${latest_page + 1}&`);
            links.push(job.start_url);
            const engine = await Engine.create(this.type, this.EngineOptions)
                .catch(err => {
                    console.error(err, 'Failed to initialize search engine. Aborting.');
                    return reject(err)
                });

            url = links[0];
            engine.get(url, {})
                .then(async response => {
                    try {
                        let $ = that.cheerio.load(response.html),url_obj;
                        if($('.content .buttons #confirm-button').length) {
                            await engine.request.Page.click('.content .buttons #confirm-button');
                            await engine.request.Page.waitForNavigation({'timeout': 90000});
                            let Body = await engine.request.Page.content();
                            $ = that.cheerio.load(Body);
                        }

                        let scope = $('div.search-form-v2-categories__item-content_active').text().trim();
                        let country_code = 'RU';
                        let brand_code =  url.split('mark-model-nameplate=')[1].trim();
                        let brand = await that.DB.getBrand(that.source_id,brand_code);
                        let run_sequence_id = job.run_sequence_id;

                        url_obj = {
                            'country_code': country_code,
                            'brand': brand_code,
                            'brand_id': brand,
                            'scope': scope,
                            'source_id':that.source_id,
                            'origin_url':url,
                            'run_sequence_id':run_sequence_id
                        };


                        that.ParsePage($, url_obj, url, function (err, status) {
                            if(err)
                                throw err;
                            (async function pagination(j){
                                if($('.pager__next.button_js_inited').length && !$('.pager__next.button_js_inited').hasClass('button_disabled')){
                                    await engine.request.Page.click('button.pager__next span.button__text');
                                    await engine.request.Page.waitFor(5000);
                                    let Body = await engine.request.Page.content();
                                    $ = that.cheerio.load(Body);
                                    let origin_url = url.replace('output_type=list&', `output_type=list&pageNumber=${j+2}&`);
                                    that.ParsePage($, url_obj, origin_url, async (err, status) => {
                                        if(err)
                                            throw err
                                        await that.DB.updateLastPage(job.id, ++latest_page)
                                        return pagination(++j)
                                    })
                                }
                                else {
                                    engine.close()
                                    return resolve()
                                }
                            })(0)

                        })

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
        })
    }

    ParsePage($,url_obj,origin_url,callback) {
        let offer_id,url,price_net,that=this,items=[],info;
        let element = $('table tbody.stat_js_inited');
        try{

            let pom ={};
            for(let i =0;i<element.length;i++){
                info = $(element[i]).attr('data-bem');
                info = JSON.parse(info);
                offer_id = info['listing-item']['id'];
                url = $(element[i]).find('div.listing-item__name a').attr('href');
                price_net =  $(element[i]).find('div.listing-item__price').text().replace(/[^0-9]/gi, '');
                url_obj['offer_id']= offer_id;
                url_obj['condition'] = null;
                url_obj['price_net']= price_net;
                url_obj['price_gross']= null;
                url_obj['vat']= null;
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
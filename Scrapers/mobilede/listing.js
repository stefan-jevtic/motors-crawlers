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

    Run(job, options) {
        return new Promise(async (resolve, reject) => {
            let that = this, url;
            let links = ['https://suchen.mobile.de/fahrzeuge/search.html?cn=PL&damageUnrepaired=NO_DAMAGE_UNREPAIRED&grossPrice=false&isSearchRequest=true&lang=en&makeModelVariant1.makeId=12100&maxPowerAsArray=PS&minPowerAsArray=PS&scopeId=STT&usage=USED&searchId=e18f85c4-d6a5-28b6-8de9-4eb1349d9191'];
           // links.push(job.start_url);
            const engine = new Engine(that.type);
            await engine.initialize(options)
                .catch(err => {
                    console.error(err, 'Failed to initialize search engine. Aborting.');
                    reject(err)
                });
            (async function loop(i) {
                if(links[i] === undefined){
                    engine.close()
                    return resolve()
                }
                let url = links[i];
                const response = await engine.get(url, {})
                    .catch(err => {
                        reject(err)
                    })
                let $ = that.cheerio.load(response.html);
                let scope = url.split('scopeId=')[1].split('&')[0];
                let usage = url.split('usage=')[1].split('&')[0];
                let country_code = url.split('cn=')[1].split('&')[0];
                let brand_code = url.split('makeModelVariant1.makeId=')[1].split('&')[0];
                let brand = ''
                let url_obj = {
                    'condition': usage,
                    'country_code': country_code,
                    'brand_': brand_code,
                    'brand_id': brand,
                    'scope': scope
                }
                let pagination = $('ul.pagination li');
                for(let p = 0; p < pagination.length; p++){
                    console.log($(pagination[p]).find('span').attr('data-href'));
                    if(links.indexOf($(pagination[p]).attr('data-href')) === -1 && !$(pagination[p]).hasClass('padding-first-button') && $(pagination[p]).find('span').attr('data-href'))
                        links.push($(pagination[p]).find('span').attr('data-href'))
                }
                if($('title').text().indexOf('Are you a human')>-1){
                    await engine.request.Page.waitForSelector('div.antigate_solver.recaptcha.solved',{'timeout':200000});
                    await engine.request.Page.click('.btn.btn--orange.u-full-width');
                    await engine.request.Page.waitForNavigation();
                    let Body  = await engine.request.Page.content();
                    $ = that.cheerio.load(Body);
                    that.ParsePage($, url_obj, function () {
                        return loop(++i);
                    })
                }else{
                    that.ParsePage($, url_obj, function () {
                        return loop(++i);
                    })
                }
            })(0)
        })
    }

    ParsePage($,url_obj,callback) {
        let offer_id,url,price_net,price_gross,hasOfferPrice,vat,that=this;
        let element = $('a.result-item');
        try{
            for(let i =0;i<element.length;i++){
                offer_id = $(element[i]).attr('data-ad-id');
                url = 'https://suchen.mobile.de/fahrzeuge/details.html?id='+offer_id+'&lang=en';
                hasOfferPrice = $(element[i]).find('.price-block span.h2.u-text-line-through').text();
                if(!hasOfferPrice){
                    price_net =  $(element[i]).find('a.result-item span.u-block').eq(0).text().replace(/[^0-9\,]/gi, '');
                    if(price_net)price_net=price_net.replace(',','.');
                    price_gross = $(element[i]).find('a.result-item span.u-block').eq(1).text().replace(/[^0-9\,]/gi, '');
                    if(price_gross)price_gross=price_gross.replace(',','.');
                    vat = $(element[i]).find('a.result-item span.u-block').eq(2).text().replace(/[^0-9\,]/gi, '');
                    if(vat)vat=vat.replace(',','.');
                }else{
                    price_net =  $(element[i]).find('a.result-item span.u-block').eq(1).text().replace(/[^0-9\,]/gi, '');
                    if(price_net)price_net=price_net.replace(',','.');
                    price_gross = $(element[i]).find('a.result-item span.u-block').eq(2).text().replace(/[^0-9\,]/gi, '');
                    if(price_gross)price_gross=price_gross.replace(',','.');
                    vat = $(element[i]).find('a.result-item span.u-block').eq(3).text().replace(/[^0-9\,]/gi, '');
                    if(vat)vat=vat.replace(',','.');
                }
                url_obj['offer_id']= offer_id;
                url_obj['price_net']= price_net;
                url_obj['price_gross']= offer_id;
                url_obj['vat']= vat;
                that.SaveInfo(url_obj);
            }
            return callback('done')
        }catch(e){
            console.log(e);
        }
    }

    SaveInfo(info) {
        console.log(info)
    }
}

module.exports=Listing;
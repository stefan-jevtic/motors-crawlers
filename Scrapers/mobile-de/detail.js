const mobilede = require('./mobilede');
const Engine = require('../../Server/Engine/Engine')
const Query = require('../../Server/DB/DB')


class Detail extends mobilede {

    constructor(type, singleInstance = false) {
        super();
        this.cheerio = require('cheerio');
        this.DB = new Query();
        this.type = type;
        this.singleInstance = singleInstance;
    }


    Run(job) {
        return new Promise(async (resolve, reject) => {
            let url = job.start_url;
            // url = 'https://suchen.mobile.de/fahrzeuge/details.html?id=269018400&cn=PL&damageUnrepaired=NO_DAMAGE_UNREPAIRED&grossPrice=false&isSearchRequest=true&makeModelVariant1.makeId=12100&pageNumber=1&scopeId=STT&usage=USED&fnai=prev&searchId=85fbfaff-5189-5d8e-5642-1c248f17da82';
            const engine = await Engine.create(this.type, this.EngineOptions)
                .catch(err => {
                    console.error(err, 'Failed to initialize search engine. Aborting.');
                    return reject(err)
                });
            engine.get(url, {})
                .then(async response => {
                    try {
                        let $ = this.cheerio.load(response.html);
                        if($('title').text().indexOf('Are you a human')>-1){
                            global.loger.warn('CAPTCHA OCCURS!')
                            global.loger.debug('Solving captcha...')
                            await engine.request.Page.waitForSelector('div.antigate_solver.recaptcha.solved',{'timeout':200000});
                            await engine.request.Page.click('.btn.btn--orange.u-full-width');
                            await engine.request.Page.waitForNavigation({'timeout':200000});
                            global.loger.debug('CAPTCHA SOLVED, CONTINUING...')
                            let Body  = await engine.request.Page.content();
                            let $2 = this.cheerio.load(Body);
                            this.ParsePage($2, url, (err, status) => {
                                engine.close();
                                if(err)
                                    return reject(err);
                                return resolve(status)
                            })
                        }
                        else{
                            this.ParsePage($, url, (err, status) => {
                                engine.close();
                                if(err)
                                    return reject(err);
                                return resolve(status)
                            })
                        }
                    }
                    catch (e) {
                        engine.close();
                        return reject(e)
                    }
                })
                .catch(err => {
                    engine.close();
                    return reject(err)
                })
        })
    }

    async ParsePage($, url, callback) {
        let title,phote_url,desc,offer_id,attribute_mappings,attribute_value_mappings,attribute_label,attribute_value,attribute_value_option,attribute_def,that=this,item={},reseller = {}, pom={},res ={}, items = [], resellers = [];

        try{
            offer_id  = url.split('?id=')[1].split('&')[0];

            console.log(that.singleInstance);
            if(!that.singleInstance){
                attribute_mappings = await that.DB.get_attribute_mappings(that.source_code,'en');
                attribute_value_mappings = await that.DB.get_attribute_value_mappings(that.source_code,'en');
            }

            title = $('h1[id=rbt-ad-title]').text().trim();
            if(title){
                item['offer_id'] = offer_id;
                item['source_id'] = that.source_id;
                item['attribute_key'] = 'title';
                item['value'] = title;
                pom = Object.assign({}, item);
                items.push(pom);
            }

            phote_url = $('div[id=rbt-gallery-img-0] img').attr('src');
            if(phote_url){
                item['offer_id'] = offer_id;
                item['source_id'] = that.source_id;
                item['attribute_key'] = 'photo_url';
                item['value'] = phote_url;
                pom = Object.assign({}, item);
                items.push(pom);
            }

            desc = $('div.description').text();
            if(desc){
                item['offer_id'] = offer_id;
                item['source_id'] = that.source_id;
                item['attribute_key'] = 'description';
                item['value'] = desc;
                pom = Object.assign({}, item);
                items.push(pom);
            }

            let element_1 = $('div.cBox-body--technical-data div.g-row');
            for(let i=0;i<element_1.length;i++){
                attribute_label = $(element_1[i]).find('div').eq(0).find('strong').text().trim();
                attribute_value = $(element_1[i]).find('div').eq(1).text().trim();

                if(!attribute_value)
                    continue;
                if(!that.singleInstance)
                    attribute_def = that.AttributeDeffinitons(attribute_mappings,attribute_label);
                if(!attribute_def){
                    console.log('Attribute mappings not found for'+attribute_label+' -  url '+url+'');
                    item['offer_id'] = offer_id;
                    item['source_id'] = that.source_id;
                    item['attribute_key'] = attribute_label;
                    item['value'] = attribute_value;
                    item['is_option'] = 0;
                    item['checked'] = 0;
                    pom = Object.assign({}, item);
                    items.push(pom);

                }
                else if (attribute_def['attribute_key'] === 'ignore'){
                    console.log('ignore attribite '+attribute_label);
                }
                else if(attribute_def['attribute_key'] === 'first registration'){
                    item['offer_id'] = offer_id;
                    item['source_id'] = that.source_id;
                    item['attribute_key'] = 'first_registration';
                    item['value'] = attribute_value;
                    item['is_option'] = 0;
                    item['checked'] = 1;
                    pom = Object.assign({}, item);
                    items.push(pom);
                    let first_registration_month = attribute_value.split('/')[0];
                    let first_registraiton_year = attribute_value.split('/')[1];

                    item['attribute_key'] = 'first_registration_year';
                    item['value'] = first_registraiton_year;
                    item['is_option'] = 0;
                    item['checked'] = 1;
                    pom = Object.assign({}, item);
                    items.push(pom);

                    item['attribute_key'] = 'first_registration_month';
                    item['value'] = first_registration_month;
                    item['is_option'] = 0;
                    item['checked'] = 1;

                    pom = Object.assign({}, item);
                    items.push(pom);

                }else {
                    item['offer_id'] = offer_id;
                    item['source_id'] = that.source_id;
                    item['attribute_key'] = attribute_def['attribute_key'];
                    if(attribute_def['attribute_type'] === 'select') {
                        if(!that.singleInstance)
                            attribute_value_option = that.OptionValue(attribute_value_mappings, attribute_def['attribute_key'], attribute_value);
                        if (attribute_value_option) {
                            item['value'] = attribute_value_option;
                            item['is_option'] = 1;
                            item['checked'] = 1;
                        } else {
                            item['value'] = attribute_value;
                            item['is_option'] = 1;
                            item['checked'] = 0;
                        }
                    }else if(attribute_def['attribute_type'] === 'bool'){
                        item['value'] = '1';
                        item['is_option'] = 0;
                        item['checked'] = 1
                    }else{
                        item['value'] = that.PostProcessing(attribute_value, attribute_def['attribute_key']);
                        item['is_option'] = 0;
                        item['checked'] = 1

                    }

                    pom = Object.assign({}, item);
                    items.push(pom);
                }

            }

            let resel_ellement = $('div[id=rbt-seller-details]');
            for(let j=0;j<resel_ellement.length;j++){
                reseller['url'] = $(resel_ellement[j]).find('a[id=dealer-hp-link-bottom]').attr('href');
                if(url.indexOf('ambitCountry=')>-1){
                    reseller['country_code'] = url.split('ambitCountry=')[1].split('&')[0];
                }else {
                    reseller['country_code'] = 'NA'
                }
                reseller['reseller_type'] = $(resel_ellement[j]).find('h4[id=rbt-db-title]').text().trim()
                if(!reseller['url']){
                    reseller['name'] =$(resel_ellement[j]).find('div.g-row div.g-col-6 p b').text().trim()
                }else{
                    reseller['name'] =$(resel_ellement[j]).find('a[id=dealer-hp-link-bottom] b').text().trim()
                }
                if(reseller['reseller_type'] === 'Business'){
                    reseller['reseller_type'] = 'B'
                }else if(reseller['reseller_type'] === 'Private Seller'){
                    reseller['reseller_type'] = 'P'
                }else {
                    reseller['reseller_type'] = 'D'
                }

                if(reseller['url']){
                    reseller['reseller_code'] = reseller['url'].split('customerId=')[1];
                }else{
                    reseller['reseller_code'] = '';
                }
                reseller['logo'] = '';
                reseller['full_address'] = $('p[id=rbt-db-address]').text().trim();
                reseller['phone'] = $('p[id=rbt-db-phone] span.u-inline-block').text();
                if(reseller['phone'])reseller['phone']=reseller['phone'].replace('Phone: ', '')
                reseller['rating'] = $('a.amount-of-ratings-link span.star-rating-s').eq(0).attr('data-rating');
                reseller['votes'] =  $('span.amount-of-ratings').text().trim();
                if(reseller['votes'])reseller['votes']=reseller['votes'].split(' ')[0];
                reseller['source_code'] = that.source_code;
                if((!reseller['name'] || !reseller['full_address']) && !reseller['reseller_code'])
                    console.log('Cannot identify reseller at this url:'+url);
                else {
                    res = Object.assign({},reseller);
                    resellers.push(res);
                }
            }
            if(!that.singleInstance)
                that.SaveInfo(items,resellers);

            //for Single instance
            if(that.singleInstance)
                return callback(null, {items:items, resellers:resellers})

            return callback(null, 'done')
        }
        catch(e){
            console.log(e);
            return callback(e, false)
        }

    }

    SaveInfo(item,reseller) {
        let that=this;
        that.DB.insertDetail(item,reseller);
    }

    AttributeDeffinitons(attribute_mappings,attribute_label){
        for(let i=0;i<attribute_mappings.length;i++){
            let attribute_pattern_utf8 = attribute_mappings[i]['attribute_pattern'].toLowerCase();
            let attribute_label_uf8 = attribute_label.toLowerCase();
            if(attribute_pattern_utf8 == attribute_label_uf8)
                return attribute_mappings[i]
        }
    }

    OptionValue(attribute_value_mappings,attribute_key,attribute_value){
        for(let i=0;i<attribute_value_mappings.length;i++){
            if(attribute_value_mappings[i]['attribute_key'] == attribute_key){
                let attribute_value_pattern_utf8 = attribute_value_mappings[i]['attribute_value_pattern'].toLowerCase();
                let attribute_value_utf8 = attribute_value.toLowerCase();
                if(attribute_value_pattern_utf8 == attribute_value_utf8)
                    return attribute_value_mappings[i]
            }
        }
    }

    PostProcessing(attribute_value, attribute_key){
        let att;
        switch (attribute_key) {
            case 'mileage':
                att = attribute_value.split(' ')[0].replace(',', '').replace('.', '');
                break;
            case 'power':
                att = attribute_value.split(' ')[0].replace(',', '').replace('.', '');
                break;
            case 'cubic_capacity':
                att = attribute_value.split(' ')[0].replace(',', '').replace('.', '');
                break;
            case 'gvw':
                att = attribute_value.split(' ')[0].replace(',', '').replace('.', '');
                break;
            default:
                att = attribute_value;
                break;
        }
        return att;
    }

}


module.exports=Detail;




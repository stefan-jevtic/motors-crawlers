const DB = require('./../../Models/index');
const moment = require('moment');
const offers = require('./../../Models/index').offers;
const GeoApi = require('./../../Utils/GoogleGeoApi/GoogleGeoApi');

class Database {

    constructor(){
        this.GeoLocation = new GeoApi();
    }

    getListingLinks(){
        return new Promise((resolve) => {
            DB.sequelize.query('select * from detail_queue where spider="mobile-de"').then((resutls,meta)=>{
                resolve(resutls);
            })
        })

    }

    updateLastPage(id, last_page){
        return DB.listing_queue.update({ last_page }, { where: { id } })
    }

    getBrand(source_id,brand_id){
        return new Promise((resolve) => {
            DB.sequelize.query('SELECT * FROM sources_brands WHERE source_id=? AND brand_source_code=?',
                {
                    replacements: [
                        source_id,
                        brand_id
                    ],
                    type: DB.sequelize.QueryTypes.SELECT
                }
            ).then(projects => {
                resolve(projects[0].brand_id)
            })
        })
    }


    insertListing(item,spider_name,origin_url){
        this.archive_offers(origin_url);

        this.delete_offers(origin_url);

        let keys=Object.keys(item);

        for(let i=0;i<item.length;i++){
            let key = keys[i];
            offers.upsert({
                scope:item[key]['scope'],
                country_code:item[key]['country_code'],
                brand_id:item[key]['brand_id'],
                brand:item[key]['brand'],
                cond:item[key]['condition'],
                currency:item[key]['currency'],
                price_net:item[key]['price_net'],
                price_gross:item[key]['price_gross'],
                vat:item[key]['vat'],
                offer_id:item[key]['offer_id'],
                source_id:item[key]['source_id'],
                url:item[key]['url'],
                run_sequence_id:item[key]['run_sequence_id']+1,
                origin_url:origin_url,
                created_at:new Date(),
                finished_at:new Date()
            }).then(result => {  });

            this.insert_offer_mappings(item[key]['origin_url'],item[key]['source_id'],item[key]['offer_id'],item[key]['brand_id'],item[key]['brand']);

            this.enqueue_detail_urls(item[key]['url'],spider_name);
        }
    }


    get_attribute_mappings(source_code,lang){
        return new Promise((resolve) => {
            DB.sequelize.query('SELECT am.attribute_key, am.attribute_pattern, d.attribute_type FROM attribute_mapping am LEFT JOIN attribute_definitions d ON d.attribute_key=am.attribute_key WHERE source_code= ? AND locale= ? ORDER BY process_order ASC',
                {
                    replacements:[
                        source_code,
                        lang
                    ]
                })
                .spread((results, meta) => {
                    resolve(results);
                })
        })
    }

    get_attribute_value_mappings(source_code,lang){
        return new Promise((resolve)=>{
            DB.sequelize.query('SELECT * FROM attribute_value_mapping WHERE source_code=? AND locale=? ORDER BY process_order ASC',
                {
                    replacements:[
                        source_code,
                        lang
                    ]
                })
                .then((results, meta) => {
                    resolve(results);
                })
        })
    }


    insert_offer_mappings(url,source_id,offer_id,brand_id,brand){
        DB.sequelize.query('INSERT IGNORE INTO offers_mapping(url, source_id, offer_id, brand_id, brand) VALUES (?,?,?,?,?)',
            {
                replacements: [
                    url,
                    source_id,
                    offer_id,
                    brand_id,
                    brand
                ],
                type: DB.sequelize.QueryTypes.INSERT
            })
            .then(result => {  })
    }

    enqueue_detail_urls(url,spider_name){
        DB.sequelize.query('INSERT IGNORE INTO detail_queue(start_url, spider) VALUES (?,?)',
            {
                replacements: [
                    url,
                    spider_name
                ],
                type: DB.sequelize.QueryTypes.INSERT
            })
            .then(result => {  })
    }

    archive_offers(origin_url){

        DB.sequelize.query('insert ignore into offers_archive (scope, country_code, brand_id, brand, cond, currency, price_net, price_gross, vat, offer_id, source_id, url, run_sequence_id, origin_url, original_date, created_at, updated_at)\n' +
            '        SELECT scope, country_code, brand_id, brand, cond, currency, price_net, price_gross, vat, offer_id, source_id, url, run_sequence_id, origin_url, created_at, NOW(), NOW() from offers where origin_url= ?',
            {
                replacements: [
                    origin_url
                ],
                type: DB.sequelize.QueryTypes.INSERT
            })
            .then(result => {  })
    }


    delete_offers(origin_url){
        DB.sequelize.query('DELETE FROM offers WHERE origin_url=?',
            {
                replacements: [
                    origin_url
                ],
                type: DB.sequelize.QueryTypes.DELETE
            })
            .then(result => {  })
    }


    get_country_code(country_code,source_id){
        return new Promise((resolve)=>{
            DB.sequelize.query('SELECT country_code FROM sources_country_codes WHERE source_id=? AND country=?',
                {
                    replacements: [
                        country_code,
                        source_id
                    ],
                    type: DB.sequelize.QueryTypes.SELECT
                }
            ).then(projects => {
                if(projects)
                    resolve(projects[0].country_code);
                else
                    resolve()
            })
        })
    }


    async insertDetail(item,reseller_item){

        let keys=Object.keys(item),that=this,reseller,reseller_id,offer_id,source_id;


        for(let i = 0; i<item.length;i++){
            let key = keys[i];
            if(item[key]['attribute_key']=='description' && item[key]['value']){
                offer_id = item[key]['offer_id'];
                source_id = item[key]['source_id'];
                that.update_offer_description(item[key]['value'],item[key]['offer_id'],item[key]['source_id'])
            }
            else if(item[key]['attribute_key']=='title' && item[key]['value']){
                offer_id = item[key]['offer_id'];
                source_id = item[key]['source_id'];
                that.update_offer_title(item[key]['value'],item[key]['offer_id'],item[key]['source_id'])
            }
            else if(item[key]['attribute_key']=='photo_url' && item[key]['value']){
                offer_id = item[key]['offer_id'];
                source_id = item[key]['source_id'];
                that.update_offer_photo_url(item[key]['value'],item[key]['offer_id'],item[key]['source_id'])
            }else {
                offer_id = item[key]['offer_id'];
                source_id = item[key]['source_id'];
                that.insert_attributes(item[key]['attribute_key'],item[key]['value'],item[key]['source_id'],item[key]['offer_id'],
                    item[key]['is_option'],item[key]['checked'])

            }
        }
        if(reseller_item.length){
            reseller = await that.get_resseler(reseller_item[0]);
            if(reseller.length){
                console.log(reseller);
                reseller_id = reseller[0]['id'];
            }else {
                let reseler_data = await that.enrich_reseller(reseller_item[0]);
                reseller_id = await that.create_reseller(reseler_data);
            }
        }
        that.update_offer_dealer(reseller_id,offer_id,source_id);
    }

    update_offer_dealer(reseller_id,offer_id,source_id){
        DB.sequelize.query('UPDATE offers_mapping SET dealer_id=? WHERE offer_id=? AND source_id=? AND dealer_id IS null',
            {
                replacements: [
                    reseller_id,
                    offer_id,
                    source_id
                ],
                type: DB.sequelize.QueryTypes.UPDATE
            })
            .then(result => {  })
    }

    update_offer_description(desc,offer_id,source_id){
        DB.sequelize.query('UPDATE offers_mapping SET description=? WHERE offer_id= ? AND source_id= ? AND description IS null',
            {
                replacements: [
                    desc,
                    offer_id,
                    source_id
                ],
                type: DB.sequelize.QueryTypes.UPDATE
            })
            .then(result => {  })
    }


    update_offer_title(title,offer_id,source_id){
        DB.sequelize.query('UPDATE offers_mapping SET title=? WHERE offer_id=? AND source_id=? AND title IS null',
            {
                replacements: [
                    title,
                    offer_id,
                    source_id
                ],
                type: DB.sequelize.QueryTypes.UPDATE
            })
            .then(result => {  })
    }

    update_offer_photo_url(photo_url,offer_id,source_id){
        DB.sequelize.query('UPDATE offers_mapping SET photo_url=? WHERE offer_id=? AND source_id=? AND photo_url IS null',
            {
                replacements: [
                    photo_url,
                    offer_id,
                    source_id
                ], type: DB.sequelize.QueryTypes.UPDATE
            })
            .then(result => {  })
    }

    insert_attributes(attribute_key,value,source_id,offer_id,is_option,checked){
        DB.sequelize.query('INSERT IGNORE INTO offer_attributes(attribute_key, value, source_id, offer_id, is_option, checked, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            {
                replacements:
                    [attribute_key,
                        value,
                        source_id,
                        offer_id,
                        is_option,
                        checked,
                        new Date(),
                        new Date()
                    ],
                type: DB.sequelize.QueryTypes.INSERT
            })
            .then(result => { })
    }

    get_conversion_rate(currency){
        return new Promise((resolve)=>{
            DB.sequelize.query('SELECT * FROM currency_conversions WHERE `from`=? ORDER BY id DESC LIMIT 1',
                {
                    replacements:[
                        currency
                    ]
                })
                .spread((resutls,meta)=>{
                    resolve(resutls);
                })
        })
    }


    get_resseler(reseller){
        return new Promise((resolve)=>{

            if(reseller['reseller_code']){
                DB.sequelize.query('SELECT * FROM resellers WHERE source_code= ? AND reseller_code=?',
                    {
                        replacements:[
                            reseller['source_code'],
                            reseller['reseller_code']
                        ]
                    })
                    .spread((resutls,meta)=>{
                        resolve(resutls);
                    })
            }else{
                DB.sequelize.query('SELECT * FROM resellers WHERE source_code=? AND name=? AND full_address=?',
                    {
                        replacements:[
                            reseller['source_code'],
                            reseller['name'],
                            reseller['full_address']
                        ]
                    })
                    .spread((resutls,meta)=>{
                        resolve(resutls);
                    })
            }
        })
    }


    async enrich_reseller(item){
        let reseller = {},geodata,that=this;
        return new Promise(async (resolve)=>{
            reseller['name'] = item['name'];
            reseller['reseller_code'] = item['reseller_code'];
            reseller['country_code'] = item['country_code'];
            reseller['reseller_type'] = item['reseller_type'];
            reseller['url'] = item['url'];
            reseller['logo'] = item['logo'];
            reseller['votes'] = item['votes'];
            reseller['rating'] = item['rating'];
            reseller['phone'] = item['phone'];
            reseller['full_address'] = item['full_address'];
            reseller['source_code'] = item['source_code'];
            reseller['geo_lat'] = null;
            reseller['geo_lng'] = null;
            reseller['street_number'] = null;
            reseller['route'] = null;
            reseller['locality'] = null;
            reseller['admin_area_level_2'] = null;
            reseller['admin_area_level_1'] = null;
            reseller['country'] = null;
            reseller['postal_code'] = null;
            reseller['geo_bounds_south_lat'] = null;
            reseller['geo_bounds_south_lng'] = null;
            reseller['geo_bounds_north_lng'] = null;
            reseller['geo_bounds_north_lat'] = null;
            reseller['place_id'] = null;

            geodata = await that.GeoLocation.GeoApiCall(reseller['full_address']);

            if(geodata){

                reseller['geo_lat'] = geodata[0]['geometry']['location']['lat'];
                reseller['geo_lng'] = geodata[0]['geometry']['location']['lng'];

                if('bounds' in geodata[0]['geometry']){
                    reseller['geo_bounds_south_lat'] = geodata[0]['geometry']['bounds']['southwest']['lat'];
                    reseller['geo_bounds_south_lng'] = geodata[0]['geometry']['bounds']['southwest']['lng'];
                    reseller['geo_bounds_north_lng'] = geodata[0]['geometry']['bounds']['northeast']['lat'];
                    reseller['geo_bounds_north_lat'] = geodata[0]['geometry']['bounds']['northeast']['lng'];
                }

                if('place_id' in geodata[0]['geometry']){
                    reseller['place_id'] = geodata[0]['place_id']
                }

                if('place_id' in geodata[0]){
                    reseller['place_id'] = geodata[0]['place_id']
                }

                if('address_components' in geodata[0]){
                    for(let address_component of geodata[0]['address_components']){

                        if(address_component['types'][0] === 'street_number'){
                            reseller['street_number'] = address_component['short_name']
                        }else if(address_component['types'][0] ==='route'){
                            reseller['route'] = address_component['short_name']
                        }else if(address_component['types'][0] ==='locality'){
                            reseller['locality'] = address_component['short_name']
                        }else if(address_component['types'][0] ==='administrative_area_level_2'){
                            reseller['admin_area_level_2'] = address_component['short_name']
                        }else if(address_component['types'][0] === 'administrative_area_level_1'){
                            reseller['admin_area_level_1'] = address_component['short_name']
                        }else if(address_component['types'][0]==='country'){
                            reseller['country'] = address_component['short_name']
                        }else if(address_component['types'][0]==='postal_code'){
                            reseller['postal_code'] = address_component['short_name']
                        }
                    }
                }
            }
            else
                global.AlertSvc(`GeoApi, no data for ${reseller['full_address']}`)

            resolve(reseller);
        })
    }

    create_reseller(reseller){
        return new Promise((resolve)=>{
            DB.sequelize.query('INSERT INTO resellers(name, source_code, reseller_code, country_code, reseller_type,url, logo, votes, rating, phone, full_address, geo_lat, geo_lng, country, street_number, postal_code, locality, route, admin_area_level_1, admin_area_level_2, place_id, geo_bounds_south_lat, geo_bounds_south_lng,geo_bounds_north_lat, geo_bounds_north_lng, created_at, updated_at) ' +
                'VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                {
                    replacements:
                        [   reseller['name'],
                            reseller['source_code'],
                            reseller['reseller_code'],
                            reseller['country_code'],
                            reseller['reseller_type'],
                            reseller['url'],
                            reseller['logo'],
                            reseller['votes'],
                            reseller['rating'],
                            reseller['phone'],
                            reseller['full_address'],
                            reseller['geo_lat'],
                            reseller['geo_lng'],
                            reseller['country'],
                            reseller['street_number'],
                            reseller['postal_code'],
                            reseller['locality'],
                            reseller['route'],
                            reseller['admin_area_level_1'],
                            reseller['admin_area_level_2'],
                            reseller['place_id'],
                            reseller['geo_bounds_south_lat'],
                            reseller['geo_bounds_south_lng'],
                            reseller['geo_bounds_north_lat'],
                            reseller['geo_bounds_north_lng'],
                            new Date(),
                            new Date()
                        ],
                    type: DB.sequelize.QueryTypes.INSERT
                })
                .then(result => {
                    resolve(result[0])
                })
        })
    }
}

module.exports=Database;

const DB = require('./../../Models/index');
const moment = require('moment');

class Database {

    constructor(){  }

    getListingLinks(){
        return new Promise((resolve) => {
            DB.sequelize.query('select * from detail_queue where spider="mobile-de"').then((resutls,meta)=>{
                resolve(resutls);
            })
        })

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


    insertListing(item,run_sequnece_id,spider_name){

        DB.sequelize.query('INSERT IGNORE INTO offers(scope, country_code, brand_id, brand, cond, currency, price_net, price_gross, vat, offer_id, source_id, url, run_sequence_id, origin_url, created_at, updated_at)' +
            'VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
            {
                replacements: [
                    item['scope'],
                    item['country_code'],
                    item['brand_id'],
                    item['brand'],
                    item['condition'],
                    item['currency'],
                    item['price_net'],
                    item['price_gross'],
                    item['vat'],
                    item['offer_id'],
                    item['source_id'],
                    item['url'],
                    item['origin_url'],
                    run_sequnece_id,
                    new Date(),
                    new Date()
                ],
                type: DB.sequelize.QueryTypes.INSERT
            }).then(result => {  })

        this.enqueue_detail_urls(item['url'],'mobile-de');

        this.insert_offer_mappings(item['origin_url'],item['source_id'],item['offer_id'],item['brand_id'],item['brand']);

        this.delete_offers(item['origin_url']);

        this.archive_offers(item['origin_url']);
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
                .then((results, meta) => {
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
                    resolve(projects[0].country_code)
                else
                    resolve()
            })
        })
    }


    insertDetail(item,reseller_item){
            let that=this;




        that.insert_attributes(item['attribute_key'],
            item['value'],
            item['source_id'],
            item['offer_id'],
            item['is_option'],
            item['checked']);

        that.update_offer_dealer(reseller_item['reseller_id'],item['offer_id'],item['source_id']);


        if(item['title']){
            that.update_offer_ttile(item['title'],item['offer_id'],item['source_id'])
        }
        if(item['photo_url']){
            that.update_offer_photo_url(item['photo_url'],item['offer_id'],item['source_id'])
        }
        if(item['desc']){
            that.update_offer_description(item['desc'],item['offer_id'],item['source_id'])
        }



        let reseller ='',reseller_id='',reseller_data;

        if(reseller_item){
            reseller = that.get_reseller(reseller_item);
            if(reseller){
                reseller_id = reseller['id'];
            }else{


            }
        }



    }



    update_offer_dealer(reseller_id,offer_id,source_id){
        DB.sequelize.query('UPDATE offers_mapping SET dealer_id=? WHERE offer_id=? AND source_id=? AND dealer_id IS NULL',
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
        DB.sequelize.query('UPDATE offers_mapping SET description=? WHERE offer_id= ? AND source_id= ? AND description IS NULL',
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


    update_offer_ttile(title,offer_id,soruce_id){
        DB.sequelize.query('UPDATE offers_mapping SET title=? WHERE offer_id=? AND source_id=? AND title IS NULL',
            {
                replacements: [
                    title,
                    offer_id,
                    soruce_id
                ],
                type: DB.sequelize.QueryTypes.UPDATE
            })
            .then(result => {  })
    }

    update_offer_photo_url(photo_url,offer_id,source_id){
        DB.sequelize.query('UPDATE offers_mapping SET photo_url=? WHERE offer_id=? AND source_id=? AND photo_url IS NULL',
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




}

module.exports=Database;

/*

    def store_detail_items(self, items, reseller_items):
        rows = []
        desc = None
        title = None
        source_id = None
        offer_id = None
        photo_url = None

        for item in items:
            if item['attribute_key']=='description':
                offer_id = item['offer_id']
                source_id = item['source_id']
                desc = item['value']
            elif item['attribute_key']=='title':
                offer_id = item['offer_id']
                source_id = item['source_id']
                title = item['value']
            elif item['attribute_key']=='photo_url':
                offer_id = item['offer_id']
                source_id = item['source_id']
                photo_url = item['value']
            else:
                row = (
                    item['attribute_key'],
                    item['value'],
                    item['source_id'],
                    item['offer_id'],
                    item['is_option'],
                    item['checked'],
                    datetime.datetime.now(),
                    datetime.datetime.now(),
                )
                rows.append(row)

        reseller = None
        reseller_id = None
        if len(reseller_items)>0:
            reseller = self.get_reseller(reseller_items[0])
            if reseller:
                reseller_id = reseller['id']
            else:
                reseller_data = self.enrich_reseller(reseller_items[0])
                reseller_id = self.create_reseller(reseller_data)

        # store new data
        self.insert_attributes(rows)

        # update offer_mapping dealer
        self.update_offer_dealer(reseller_id, offer_id, source_id)

        if desc:
            self.update_offer_description(desc, offer_id, source_id)

        if title:
            self.update_offer_title(title, offer_id, source_id)

        if photo_url:
            self.update_offer_photo_url(photo_url, offer_id, source_id)




 */
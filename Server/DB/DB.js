const DB = require('./../../Models/index')



class Database {

    constructor(){

    }

    getListingLinks(){

        return new Promise((resolve)=>{
            DB.sequelize.query('select * from detail_queue where spider="mobile-de"').then((resutls,meta)=>{
                resolve(resutls);
            })
        })

    }




}





module.exports=Database;
const db = require('./Server/DB/DB');
const mobilde = require('./Scrapers/mobile-de/listing');



const QUERY = new db();


QUERY.getListingLinks((data)=>{
    console.log(data);
})


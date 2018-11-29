const googleMapsClient = require ('@google/maps');
class GoogleGeoApi{

    constructor(){
        this.api_key = process.env.GEO_API_KEY;
    }

    GeoApiCall(address){
        return new Promise((resolve, reject) => {
            let client = googleMapsClient.createClient({key: this.api_key});
            client.geocode({ address }, (err, response) => {
                if (!err) {
                    console.log(response.json.results);
                    resolve(response.json.results);
                }else {
                    console.log(err);
                    reject(err);
                }
            });
        })
    }
}


module.exports = GoogleGeoApi;
const request = require('request');
const fs = require('fs')

class Request{

    constructor(options){
        this.encoding = 'encoding' in options ? options.encoding : null;
        this.timeout = 'timeout' in options ? options.timeout : 30000;
        this.jar = 'jar' in options ? options.jar : false;
        this.maxRedirects = 'maxRedirects' in options ? options.maxRedirects : 10;
        this.removeRefererHeader = 'removeRefererHeader' in options ? options.removeRefererHeader : false;
    }

    init(){
        return new Promise((resolve, reject) => resolve())
    }

    goto(url, options, callback){
        let that = this;
        let obj= {
            url:url,
            method:'get',
            ca: fs.readFileSync(`${__dirname}/../../crawlera-ca.crt`),
            requestCert: true,
            rejectUnauthorized: true,
            //jar: true,
            maxRedirects: 'maxRedirects' in options ? options.maxRedirects : this.maxRedirects,
            encoding: 'encoding' in options ? options.encoding : this.encoding,
            headers: {
                'User-Agent': options.agent ? options.agent : 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.135 Safari/537.36',
                'X-Forwarded-For':'',
                'max-forwards':10,
                'Connection': 'close',
                //'Cookie': 'erf=AAAAAFuzfYKD/VN4AxrtAg==; ipp_uid1=1538489730236; ipp_uid2=VS1jlV2ROSUFIDN1/XJbumIlHMh56Ww/zsZZGDQ==; PHPSESSID=sc28cqqs34quvprd5n8387ibb1; BITRIX_SM__sk=6e9bb65d68dd9671f58c208e6b889331; ipp_uid=1538489730236/VS1jlV2ROSUFIDN1/XJbumIlHMh56Ww/zsZZGDQ==; _ga=GA1.2.47658727.1538489732; _gid=GA1.2.1582961051.1538489732; rrpvid=105211436659804; tracker_ai_user=Qz6GM|2018-10-02T14:15:33.057Z; BX_USER_ID=84b6b37213508bc2ac5adec9be5a6b6f; rcuid=5b45c2a3fdfb6400015f30f4; rrlpuid=; mindboxDeviceUUID=b5d8844a-0d93-46ff-96ad-673f9a697ea3; directCrm-session=%7B%22deviceGuid%22%3A%22b5d8844a-0d93-46ff-96ad-673f9a697ea3%22%7D; BITRIX_SM_ABTEST_FULLSCREEN_BANNER=A; ipp_key=v1538493683449/2713/qoVD+VZFelFc6cFtcd/iwQ=='
            },
            agent:false,
            timeout:'timeout' in options ? options.timeout : this.timeout,
            followAllRedirects: true
        };


        (function loop(i){
            obj.proxy = 'http://18a4453ab71141c7bada9d4b98cf74d1:@proxy.crawlera.com:8010';
            request.get(obj, (err, response, body) => {
                if(err){
                    if(i > 7){
                        return callback(new Error('Engine error! Engine failed after 7 times!!!'), null);
                    }
                    if(err.statusCode && err.statusCode.startsWith('4')){
                        return callback(err.code, null);
                    }
                    setTimeout(() => {
                        return loop(++i);
                    },2000);
                }
                else{
                    if(response.statusCode.toString().startsWith('4')){
                        console.log('STATUS CODE IS 4XX!!!!' + response.statusCode);
                        return callback(response.statusCode, {response, body})
                    }

                    return callback(null, {html:body});
                }
            })
        }(0))
    }

    end(){
        return 1
    }
}

module.exports = Request;
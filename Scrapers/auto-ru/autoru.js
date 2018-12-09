
class Autoru{

    constructor(){
        this.name = 'auto-ru';
        this.source_id = 11;
        this.source_code = 'auto-ru';
        this.EngineOptions = {
            waitUntil: 'domcontentloaded',
            timeout: 60000,
            height: 768,
            width: 1366
        }
    }
}

module.exports = Autoru;
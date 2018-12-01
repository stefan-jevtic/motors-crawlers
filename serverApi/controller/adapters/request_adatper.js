'use strict';

class Adapter{

  static adapter(api_params){
    
    const regex = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/gm;
    let regexResult;

    //parse
    let obj = {
      start_url : api_params.detail_url,
      spider : api_params.spider_name,
      engine : api_params.engine || "Chrome",
      
      num_failures: 0,
      status: 'READY',
      reserved_at: null,
      finished_at: null 
    };

    if(regexResult = regex.exec(obj.start_url) == null){
      return "error";
    }

    

    //check if data is correct
    return obj;
    
  }


}



  module.exports = Adapter;
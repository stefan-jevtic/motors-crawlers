'use strict';

var express = require('express');
var router = express.Router();


const Adapter = require('../controller/adapters/request_adatper')

/* POST home page. */
router.post('/detail', async function(req, res, next) {
  
  /* Receive api parameters */
  let api_params = req.body;
  let item = Adapter.adapter(api_params);

  if(item == "error")
    res.json({ ERROR: "ERROR parameters which you pass to the api are wrong!"})

  const Detail = require(`../../Scrapers/${item.spider}/detail`);
  let SingleDetail = new Detail(item.engine, true);

  try{
    let result = await SingleDetail.Run(item);
    res.json({data: result})
  }
  catch{
    res.json({ ERROR: "ERROR parameters which you pass to the api are wrong!"})
  }
});

/* We have bag .. when we want to conntact the url which donesnot exist, the program have critical bag here ENDLESS LOOP */

module.exports = router;
 
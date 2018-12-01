var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/detail', function(req, res, next) {
  res.render('index', {});
});

module.exports = router;

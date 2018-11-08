require('dotenv').config();
Promise = require('bluebird');
_ = require('lodash');
const os = require('os');

var winston = require('winston');
require('winston-loggly-bulk');

const transports = [
  new (winston.transports.Console)({
    timestamp: true,
    colorize: true
  })
]

if(process.env.ENV=='production'){
  transports.push(
    new (winston.transports.Loggly)({
      token: process.env.LOGGLY_KEY,
      subdomain: "pricefy",
      json: true,
      tags: ["motors", os.hostname()]
    })
  )
}

logger = new (winston.Logger)({
  handleExceptions: true,
  level: process.env.LOGGER_LEVEL,
  transports: transports
});
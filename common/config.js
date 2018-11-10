require('dotenv').config();
const os = require('os');
const winston = require('winston');
const Slack = require('node-slack')
require('winston-loggly-bulk');

const transports = [
    new winston.transports.Console({
        timestamp: true,
        colorize: true,
        format: winston.format.simple()
    })
]

if(process.env.ENV === 'production'){
  transports.push(
    new winston.transports.Loggly({
      token: process.env.LOGGLY_KEY,
      subdomain: "pricefy",
      json: true,
      tags: ["motors", os.hostname()]
    })
  )
}

global.loger = winston.createLogger({
    handleExceptions: true,
    level: process.env.LOGGER_LEVEL,
    transports: transports
})

global.AlertSvc = message => {
    const slack = new Slack(process.env.SLACK_HOOK);
    const compositeMessage = '['+os.hostname()+']['+process.env.ENV+'] '+message;
    slack.send({
        text: compositeMessage,
        channel: '#motors-alerts',
        username: 'MotorsBot'
    });
}
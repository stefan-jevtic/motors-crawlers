'use strict'

const fs        = require("fs");
const path      = require("path");
const Sequelize = require("sequelize");

const sequelize = new Sequelize(process.env.DB_NAME,process.env.DB_USER,process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialect: 'mysql',
  logging: false,
  pool: {
    max: 4,
    min: 0,
    idle: 20000,
    acquire: 20000,
  },
  retry: { 
    match: [
      'SequelizeDatabaseError: Deadlock found when trying to get lock; try restarting transaction',
      'ER_LOCK_DEADLOCK',
      'TimeoutError: ResourceRequest timed out',
      /ETIMEDOUT/,
			/EHOSTUNREACH/,
			/ECONNRESET/,
			/ECONNREFUSED/,
			/ESOCKETTIMEDOUT/,
			/EHOSTUNREACH/,
			/EPIPE/,
			/EAI_AGAIN/,
			/SequelizeConnectionError/,
			/SequelizeConnectionRefusedError/,
			/SequelizeHostNotFoundError/,
			/SequelizeHostNotReachableError/,
			/SequelizeInvalidConnectionError/,
			/SequelizeConnectionTimedOutError/
    ], 
    max: 3 
  }
});

const db = {};

fs
  .readdirSync(__dirname)
  .filter(function(file) {
    return (file.indexOf(".") !== 0) && (file !== "index.js");
  })
  .forEach(function(file) {
    var model = sequelize.import(path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach(function(modelName) {
  if ("associate" in db[modelName]) {
    db[modelName].associate(db);
  }
});





db.sequelize = sequelize;
db.Sequelize = Sequelize;




module.exports = db;

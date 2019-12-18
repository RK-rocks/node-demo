'use strict';
var mysql = require('mysql2');
var Sequelize = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];
var sequelize = new Sequelize(config.database, config.username, config.password, {
    host: config.host,
    port: config.port,
    dialect: 'mysql'
});
sequelize.authenticate()
    .then(function () {
        console.log("Database CONNECTED! ");
    })
    .catch(function (err) {
        console.log(err)
        console.log("SOMETHING DONE GOOFED");
    })
    .done();

module.exports = sequelize;
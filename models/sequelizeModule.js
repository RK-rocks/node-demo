
var sequelize = require('../models/config');
var Sequelize = require('sequelize');
var tbl_user = require('../models/tbl_user')
var tbl_email_template = require('../models/tbl_email_templates')



var userModel = tbl_user(sequelize, Sequelize)
module.exports['tbl_user'] = userModel

var emailTemplateModel = tbl_email_template(sequelize, Sequelize)
module.exports['tbl_email_template'] = emailTemplateModel

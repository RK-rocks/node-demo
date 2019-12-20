
var sequelize = require('../models/config');
var Sequelize = require('sequelize');
var tbl_user = require('../models/tbl_user')
var tbl_email_template = require('../models/tbl_email_templates')
var tbl_orders = require('../models/tbl_orders')
var tbl_product = require('../models/tbl_product')
var tbl_product_colors = require('../models/tbl_product_colors')
var tbl_shipping_address = require('../models/tbl_shipping_address')


var userModel = tbl_user(sequelize, Sequelize)
module.exports['tbl_user'] = userModel

var emailTemplateModel = tbl_email_template(sequelize, Sequelize)
module.exports['tbl_email_template'] = emailTemplateModel

var productModel = tbl_product(sequelize, Sequelize)
module.exports['tbl_product'] = productModel

var orderModel = tbl_orders(sequelize, Sequelize)
module.exports['tbl_orders'] = orderModel

var productColorModel = tbl_product_colors(sequelize, Sequelize)
module.exports['tbl_product_colors'] = productColorModel

var shippingAddressesModel = tbl_shipping_address(sequelize, Sequelize)
module.exports['tbl_shipping_address'] = shippingAddressesModel

//Define relationship for all
productModel.hasMany(orderModel,{foreignKey: 'product_id'})
orderModel.belongsTo(productModel,{foreignKey: 'product_id'})

//Define relationship for all
userModel.hasMany(orderModel,{foreignKey: 'user_id'})
orderModel.belongsTo(userModel,{foreignKey: 'user_id'})

productModel.hasMany(productColorModel,{foreignKey: 'product_id'})
productColorModel.belongsTo(productModel,{foreignKey: 'product_id'})

userModel.hasMany(shippingAddressesModel,{foreignKey: 'product_id'})
shippingAddressesModel.belongsTo(userModel,{foreignKey: 'product_id'})
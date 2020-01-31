
var sequelize = require('../models/config');
var Sequelize = require('sequelize');
var tbl_user = require('../models/tbl_user')
var tbl_email_template = require('../models/tbl_email_templates')
var tbl_orders = require('../models/tbl_orders')
var tbl_product = require('../models/tbl_product')
var tbl_product_colors = require('../models/tbl_product_colors')
var tbl_color = require('../models/tbl_color')
var tbl_category = require('../models/tbl_category')
var tbl_shipping_address = require('../models/tbl_shipping_address')
var tbl_product_images = require('../models/tbl_product_images')
var tbl_product_ratings = require('../models/tbl_product_ratings')
var tbl_user_cart = require('../models/tbl_user_cart')

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

var colorModel = tbl_color(sequelize, Sequelize)
module.exports['tbl_color'] = colorModel

var categoryModel = tbl_category(sequelize, Sequelize)
module.exports['tbl_category'] = categoryModel

var shippingAddressesModel = tbl_shipping_address(sequelize, Sequelize)
module.exports['tbl_shipping_address'] = shippingAddressesModel

var productImagesModel = tbl_product_images(sequelize, Sequelize)
module.exports['tbl_product_images'] = productImagesModel

var productRatingsModel = tbl_product_ratings(sequelize, Sequelize)
module.exports['tbl_product_ratings'] = productRatingsModel

var userCartModel = tbl_user_cart(sequelize, Sequelize)
module.exports['tbl_user_cart'] = userCartModel

//Define relationship for all
productModel.hasMany(orderModel,{foreignKey: 'product_id'})
orderModel.belongsTo(productModel,{foreignKey: 'product_id'})

productModel.hasMany(productRatingsModel,{foreignKey: 'product_id'})
productRatingsModel.belongsTo(productModel,{foreignKey: 'product_id'})

//Define relationship for all
userModel.hasMany(orderModel,{foreignKey: 'user_id'})
orderModel.belongsTo(userModel,{foreignKey: 'user_id'})

productModel.hasMany(productColorModel,{foreignKey: 'product_id'})
productColorModel.belongsTo(productModel,{foreignKey: 'product_id'})

productModel.hasMany(productImagesModel,{foreignKey: 'product_id'})
productImagesModel.belongsTo(productModel,{foreignKey: 'product_id'})

colorModel.hasMany(productColorModel,{foreignKey: 'color_id'})
productColorModel.belongsTo(colorModel,{foreignKey: 'color_id'})

userModel.hasMany(shippingAddressesModel,{foreignKey: 'user_id'})
shippingAddressesModel.belongsTo(userModel,{foreignKey: 'user_id'})

userModel.hasMany(userCartModel,{foreignKey: 'user_id'})
userCartModel.belongsTo(userModel,{foreignKey: 'user_id'})

productModel.hasMany(userCartModel,{foreignKey: 'product_id'})
userCartModel.belongsTo(productModel,{foreignKey: 'product_id'})

productColorModel.hasMany(userCartModel,{foreignKey: 'product_color_id'})
userCartModel.belongsTo(productColorModel,{foreignKey: 'product_color_id'})

productColorModel.hasMany(orderModel,{foreignKey: 'product_color_id'})
orderModel.belongsTo(productColorModel,{foreignKey: 'product_color_id'})

productImagesModel.hasMany(userCartModel,{foreignKey: 'product_image_id'})
userCartModel.belongsTo(productImagesModel,{foreignKey: 'product_image_id'})
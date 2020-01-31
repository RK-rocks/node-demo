'use strict';
var express = require('express')
var router = express.Router()
module.exports = router;
const fs = require("fs");
const path = require("path");
const puppeteer = require('puppeteer');
const handlebars = require("handlebars");
const createPDF = require('../assets/PdfTemplate/pdf-generator')

const Products = require('../models/sequelizeModule').tbl_product
const Orders = require('../models/sequelizeModule').tbl_orders
const Productcolors = require('../models/sequelizeModule').tbl_product_colors
const ProductImages = require('../models/sequelizeModule').tbl_product_images
const Sequelize = require('sequelize')
const Op = Sequelize.Op;
const Colors = require('../models/sequelizeModule').tbl_color
var User = require('../models/sequelizeModule').tbl_user
const ShippingAddresses = require('../models/sequelizeModule').tbl_shipping_address


console.log(createPDF)
router.post('/checkoutcart', async function(req, res){
    try {
		let user_id = 5

		//for getting cart details
		let cartData = await Orders.findOne({
			attributes:['id','order_id','total_item','createdAt'],
			where:[{
				id: {
					[Op.eq] : 113
				}
			}],
			include:[
			  {
				model:Products,
				attributes:['id','name','price','description'],
				require:true,
			  },
			  {
				model:Productcolors,
				require:true,
				attributes:['id'],
				include:[{
					model:Colors,
					attributes:['color'],
					require:true
				}]
			  },
			  {
				model:User,
				attributes:['id','first_name','last_name','email'],
				include:[{
					model:ShippingAddresses,
					where:[{
						is_default:{
							[Op.eq] : 'yes'
						}
					}]
				}]
			  }
			]
		  })
		//   console.log(cartData)
		  if(cartData){
			let totalItem = cartData.total_item
			let createdAt = cartData.createdAt
			let order_id = cartData.order_id
			let productPrice = cartData.tbl_product.price
			let total = totalItem * productPrice
			let first_name = cartData.tbl_user.first_name
			let last_name = cartData.tbl_user.last_name
			let email = cartData.tbl_user.email
			let address = cartData.tbl_user.tbl_shipping_addresses.address
			const data = {
				totalItem:totalItem,
				createdAt:createdAt,
				description: cartData.tbl_product.description,
				rate:productPrice,
				order_id: order_id,
				name: first_name+last_name,
				email: email,
				address: address,
				total:total
			}
			let obj = new createPDF(data)
			if(obj.error){
				console.log(obj.error)
			}
			console.log('obj',obj)
			if(obj){
				res.status(200).json({
					message:"Done",
					data:{},
					status:1
				})
			}
		}
    }catch(error){
        res.status(500).json({
            message:error.message,
            data:{},
            status:0
        })
    }
})


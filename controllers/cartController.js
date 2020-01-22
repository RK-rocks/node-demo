'use strict';
var express = require('express')
var router = express.Router()
module.exports = router;

const constant  = require('../assets/constant')
const Products = require('../models/sequelizeModule').tbl_product
const Orders = require('../models/sequelizeModule').tbl_orders
const Productcolors = require('../models/sequelizeModule').tbl_product_colors
const ProductImages = require('../models/sequelizeModule').tbl_product_images
const Colors = require('../models/sequelizeModule').tbl_color
const Category = require('../models/sequelizeModule').tbl_category
const Ratings = require('../models/sequelizeModule').tbl_product_ratings
const UserCart = require('../models/sequelizeModule').tbl_user_cart

const Sequelize = require('sequelize')
const Op = Sequelize.Op;
const Joi = require('@hapi/joi');


//this is for get cart details
router.post('/getcartdetails', async function(req, res) {
  try {
    const schema = Joi.object().keys({
      user_id:Joi.number().required(),
    });
    try {
      const value = await schema.validateAsync({user_id:req.body.user_id});
      const { user_id } = req.body;
      
      //for getting cart details
      let cartData = await UserCart.findAll({
        attributes:['id','total_item'],
        where:[{
            user_id: {
                [Op.eq] : user_id
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
            model:ProductImages,
            require:true,
            attributes:['id','image'],
          }
        ]
      })
      if(cartData.length == 0){
        res.status(200).json({
          message:'Products not found',
          data:{},
          status:0
        })
        return
      }else{
        res.status(200).json({
          message:'Products founds',
          data:{cartData},
          status:1
        })
      }
    } catch (error) {
      res.status(201).json({
        message:error.message,
        data:{},
        status:0
      })
    }
  } catch (error) {
    res.status(201).json({
      message:error.message,
      data:{},
      status:0
    })
  }
})
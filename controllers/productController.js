'use strict';
var express = require('express')
var router = express.Router()
module.exports = router;

const constant  = require('../assets/constant')
const Products = require('../models/sequelizeModule').tbl_product
const Orders = require('../models/sequelizeModule').tbl_orders
const Productcolors = require('../models/sequelizeModule').tbl_product_colors
const Sequelize = require('sequelize')
const Op = Sequelize.Op;
const Joi = require('@hapi/joi');

router.post('/getproducts', async function(req, res) {
  try {
    const schema = Joi.object({
      user_id:Joi.number().required()
    })
    try {
      const value = await schema.validateAsync({user_id:req.body.user_id});
      const { user_id } = req.body;
      let productData = await Products.findAll({
        attributes:['name','price','features'],
        where:[{
          is_deleted:{
            [Op.eq] : 'no'
          }
        }],
        include:[
          {
            model:Productcolors,
            attributes:['color'],
            where:[{
              is_deleted:{
                [Op.eq] : 'no'
              }
            }]
          }
        ]
      })
      if(productData.length == 0){
        res.status(200).json({
          message:'Products not found',
          data:{},
          status:0
        })
        return
      }else{
        res.status(200).json({
          message:'Products founds',
          data:{productData},
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
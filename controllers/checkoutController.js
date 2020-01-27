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


//this function is used for update quantity of cart
router.post('/checkoutcart', async function(req, res){
  try {
    const schema = Joi.object().keys({
      user_id:Joi.number().required()
    });
    try {
      const value = await schema.validateAsync({
        user_id:req.body.user_id,
      });
      const { user_id,cart_id,total_item } = req.body;
      try {
        let cartData = await UserCart.findOne({
          attributes:['id'],
          where:[{
              user_id: {
                  [Op.eq] : user_id
              }
          }],
        })
        if(cartData.length == 0){
          res.status(200).json({
            message:'Cart data not found',
            data:{},
            status:0
          })
          return
        }
        try {
            let getTotalQuantity = await UserCart.findOne({
                attributes:[[Sequelize.fn('sum', Sequelize.col('total')), 'total_item']],
                where:[{
                  user_id : {
                    [Op.eq] : user_id
                  }
                }]
              })

          //for update quantity
          let updCartData = await UserCart.update(
            {
              total_item:total_item
            },
            {
              where:[{
                  id: {
                      [Op.eq] : cart_id
                  }
              }],
            }
          )
          if(updCartData){

            let getTotalQuantity = await UserCart.findOne({
              attributes:[[Sequelize.fn('count', Sequelize.col('id')), 'total_item']],
              where:[{
                user_id : {
                  [Op.eq] : user_id
                }
              }]
            })

            res.status(200).json({
              message:'Quantity updated successfully.',
              data:{getTotalQuantity},
              status:1
            })
          }
        } catch (error) {
          res.status(500).json({
            message:error.message,
            data:{},
            status:0
          })
        }
      } catch(error) {
        res.status(500).json({
          message:error.message,
          data:{},
          status:0
        })
      }
    } catch(error) {
      res.status(500).json({
        message:error.message,
        data:{},
        status:0
      })
    }
  } catch(error) {
    res.status(500).json({
      message:error.message,
      data:{},
      status:0
    })
  }
})
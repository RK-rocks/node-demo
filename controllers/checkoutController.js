'use strict';
var express = require('express')
var router = express.Router()
module.exports = router;

const fs = require("fs");
const path = require("path");
const puppeteer = require('puppeteer');
const handlebars = require("handlebars");
// const createPDF = require('../assets/PdfTemplate/pdf-generator')

const constant  = require('../assets/constant')
const Products = require('../models/sequelizeModule').tbl_product
const Orders = require('../models/sequelizeModule').tbl_orders
const Productcolors = require('../models/sequelizeModule').tbl_product_colors
const ProductImages = require('../models/sequelizeModule').tbl_product_images
const Colors = require('../models/sequelizeModule').tbl_color
const Category = require('../models/sequelizeModule').tbl_category
const Ratings = require('../models/sequelizeModule').tbl_product_ratings
const UserCart = require('../models/sequelizeModule').tbl_user_cart
var randtoken = require('rand-token')
const stripe = require('stripe')('sk_test_vqYV7RXbuYUeY6SqZANV7FfA00FwP0zGpa');
const ShippingCharge = require('../assets/constant')
const Sequelize = require('sequelize')
const Op = Sequelize.Op;
const Joi = require('@hapi/joi');
var User = require('../models/sequelizeModule').tbl_user
const ShippingAddresses = require('../models/sequelizeModule').tbl_shipping_address
const sendMailWithAttachment = require('./commonController').sendMailWithAttachment
const createPDF = require('./commonController').createPDF
const EmailTemplate = require('../models/sequelizeModule').tbl_email_template


// console.log('stripe',stripe.charges.create)
//this function is used for update quantity of cart
router.post('/checkoutcart', async function(req, res){
  try {
    const schema = Joi.object().keys({
      user_id:Joi.number().required(),
      token:Joi.string().required()
    });
    try {
      const value = await schema.validateAsync({
        user_id:req.body.user_id,
        token:req.body.token
      });
      const { user_id,cart_id,total_item,token } = req.body;
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
            let getTotalQuantity = await UserCart.findAll({
                attributes:['id','total_item','product_id','product_color_id','product_image_id'],
                where:[{
                  user_id : {
                    [Op.eq] : user_id
                  }
                }],
                include:[
                  {
                    model:Products,
                    attributes:['id','name','price','description'],
                    require:true,
                  },
                ],
                // raw:true
              })

              var totalValu=0
              let tax = 0
              let grand 
              var letCartData = await getTotalQuantity.map(async function(el) {
                var allTotal = 0
                var o = Object.assign({}, el);
                totalValu = el.total_item * el.tbl_product.price
                let token = randtoken.generate(4);
                allTotal = allTotal + totalValu
                grand = allTotal
                console.log("grand+++++++++++++++++++++++++++++++++",grand)
                //add total value and product id and product image id and color id in order table
                let addOrder = await Orders.create({
                  order_id:"#"+token,
                  product_color_id:el.product_color_id,
                  user_id:user_id,
                  product_id:el.product_id,
                  total_item:el.total_item,
                  price_total:totalValu
                })

                //this is for generate pdf for all invoices
                //for getting cart details
                let cartData = await Orders.findOne({
                  attributes:['id','order_id','total_item',
                  [Sequelize.fn('date_format', Sequelize.col('tbl_orders.createdAt'), '%Y-%m-%d'), 'createdAt']],
                  where:[{
                    id: {
                      [Op.eq] : addOrder.id
                    }
                  }],
                  include:[
                    {
                    model:Products,
                    attributes:['id','name','price','description','image'],
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
                  console.log(cartData)
                  if(cartData){
                  let totalItem = cartData.total_item
                  let createdAt = cartData.createdAt
                  let order_id = cartData.order_id
                  let productPrice = cartData.tbl_product.price
                  let productName = cartData.tbl_product.name
                  let productImage = cartData.tbl_product.image
                  let total = totalItem * productPrice
                  let first_name = cartData.tbl_user.first_name
                  let last_name = cartData.tbl_user.last_name
                  let email = cartData.tbl_user.email
                  let address = cartData.tbl_user.tbl_shipping_addresses.address
                  let color = cartData.tbl_product_color.tbl_color.color
                  var milis = new Date();
			            milis = milis.getTime();
                  const data = {
                    totalItem:totalItem,
                    createdAt:createdAt,
                    description: cartData.tbl_product.description,
                    item:productName,
                    rate:productPrice,
                    order_id: order_id,
                    name: first_name+last_name,
                    email: email,
                    address: address,
                    total:total,
                    milis:milis,
                    color:color,
                    image:productImage
                  }
                  let obj = await createPDF(data)
                  if(obj){
                    let subject = 'Pdf attachment'
                    try {
                      // console.log("ljbjbjkbb")
                      // console.log(EmailTemplate)
                      let pathAttachmnt = path.join('assets/PdfTemplate/pdf', `${data.name}-${data.milis}.pdf`);
                      let html = await EmailTemplate.findOne({
                        where:{
                          id : {
                            [Op.eq]:2
                          }
                        }
                      })
                      let emailBody = html.html.toString()
                      var body = emailBody.replace('{EMAIL}',data.email)
                      const sendMailr = await sendMailWithAttachment(data.email,body,subject,pathAttachmnt)
                      console.log(sendMailr);
                      if(sendMailr){
                        // console.log(sendMailr)
                        let updatePdfName = await Orders.update(
                          {
                            pad_name: `${data.name}-${data.milis}.pdf`
                          },
                          {
                            where: {
                              id: {
                                [Op.eq] : addOrder.id
                              }
                            }
                        })
                      }else{
                        res.status(201).json({
                          message:error.message,
                          data:{},
                          status:0
                        })
                        return
                      }
                    }catch(error){
                      res.status(500).json({
                        message:error.message,
                        data:{},
                        status:0
                      })
                    }
                  }
                }

                return o;
              })
              // console.log('allTotal',allTotal)
              // console.log('token',token)
              let orderId = randtoken.generate(4);
              // `source` is obtained with Stripe.js; see https://stripe.com/docs/payments/accept-a-payment-charges#web-create-token
              grand =  parseInt(grand) + 15 + parseInt(((grand%5)/100))
              await stripe.charges.create({
                  amount: (grand*100),
                  currency: "usd",
                  source: "tok_mastercard", // obtained with Stripe.js
                  metadata: {'order_id': orderId},
                  description: 'Example charge',
                  shipping: {
                    name: 'Jenny Rosen',
                    address: {
                      line1: '510 Townsend St',
                      postal_code: '98140',
                      city: 'San Francisco',
                      state: 'CA',
                      country: 'US',
                    },
                  },
                },
                async function(err, charge) {
                  
                  // console.log(charge)
                  try {
                    let resultDetele = UserCart.destroy({
                      where:[{
                        user_id : {
                          [Op.eq] : user_id
                        }
                      }]
                    })
                    res.status(200).json({
                      message:'Order placed successfully.',
                      data:{},
                      status:1
                    })
                  } catch (error) {
                    res.status(500).json({
                      message:error.message,
                      data:{},
                      status:0
                    })
                  }
                }
              );

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

// console.log('stripe',stripe.charges.create)
//this function is used for update quantity of cart
router.post('/checkoutcartnew', async function(req, res){
  try {
    const schema = Joi.object().keys({
      user_id:Joi.number().required(),
      token:Joi.string().required()
    });
    try {
      const value = await schema.validateAsync({
        user_id:req.body.user_id,
        token:req.body.token
      });
      const { user_id,cart_id,total_item,token } = req.body;
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
            let getTotalQuantity = await UserCart.findAll({
                attributes:['id','total_item','product_id','product_color_id','product_image_id'],
                where:[{
                  user_id : {
                    [Op.eq] : user_id
                  }
                }],
                include:[
                  {
                    model:Products,
                    attributes:['id','name','price','description'],
                    require:true,
                  },
                ],
                // raw:true
              })

              var totalValu=0
              let tax = 0
              let grand
              var arryOrderIds = []
              var letCartData = await getTotalQuantity.map(async function(el) {
                var allTotal = 0
                var o = Object.assign({}, el);
                totalValu = el.total_item * el.tbl_product.price
                let token = randtoken.generate(4);
                allTotal = allTotal + totalValu
                grand = allTotal
                //add total value and product id and product image id and color id in order table
                let addOrder = await Orders.create({
                  order_id:"#"+token,
                  product_color_id:el.product_color_id,
                  user_id:user_id,
                  product_id:el.product_id,
                  total_item:el.total_item,
                  price_total:totalValu
                })
                await arryOrderIds.push(addOrder.id)
                

                return o;
              })
              console.log("arryOrderIds",arryOrderIds)
              return
              //this is for generate pdf for all invoices
                //for getting cart details
                let cartData = await Orders.findOne({
                  attributes:['id','order_id','total_item',
                  [Sequelize.fn('date_format', Sequelize.col('tbl_orders.createdAt'), '%Y-%m-%d'), 'createdAt']],
                  where:[{
                    id: {
                      [Op.eq] : addOrder.id
                    }
                  }],
                  include:[
                    {
                    model:Products,
                    attributes:['id','name','price','description','image'],
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

            
                  console.log(cartData)
                  if(cartData){
                  let totalItem = cartData.total_item
                  let createdAt = cartData.createdAt
                  let order_id = cartData.order_id
                  let productPrice = cartData.tbl_product.price
                  let productName = cartData.tbl_product.name
                  let productImage = cartData.tbl_product.image
                  let total = totalItem * productPrice
                  let first_name = cartData.tbl_user.first_name
                  let last_name = cartData.tbl_user.last_name
                  let email = cartData.tbl_user.email
                  let address = cartData.tbl_user.tbl_shipping_addresses.address
                  let color = cartData.tbl_product_color.tbl_color.color
                  var milis = new Date();

                  let html = ''
                html = html + `<tr class="service">
                <td class="tableitem">
                  <p class="itemtext">`+cartData.total_item+`</p>
                  </td>
                <td class="tableitem">
                <p class="itemtext">`+cartData.total_item+`</p>
                </td>
                <td class="tableitem">
                <p class="itemtext">`+color+`</p>
                </td>
                <td class="tableitem">
                <p class="itemtext">$`+productPrice+`</p>
                </td>
                <td class="tableitem">
                <p class="itemtext">`+totalItem+`</p>
                </td>
                <td class="tableitem">
                <p class="itemtext">$`+total+`</p>
                </td>
              </tr>`

			            milis = milis.getTime();
                  var data = {
                    totalItem:totalItem,
                    createdAt:createdAt,
                    order_id: order_id,
                    name: first_name+last_name,
                    email: email,
                    address: address,
                    milis:milis,
                    html:html
                  }
                  
                }

              let obj = await createPDF(data)
                  if(obj){
                    console.log(data)
                    let subject = 'Pdf attachment'
                    try {
                      // console.log("ljbjbjkbb")
                      // console.log(EmailTemplate)
                      let pathAttachmnt = path.join('assets/PdfTemplate/pdf', `${data.name}-${data.milis}.pdf`);
                      let html = await EmailTemplate.findOne({
                        where:{
                          id : {
                            [Op.eq]:2
                          }
                        }
                      })
                      let emailBody = html.html.toString()
                      var body = emailBody.replace('{EMAIL}',data.email)
                      const sendMailr = await sendMailWithAttachment(data.email,body,subject,pathAttachmnt)
                      console.log(sendMailr);
                      if(sendMailr){
                        // console.log(sendMailr)
                        let updatePdfName = await Orders.update(
                          {
                            pad_name: `${data.name}-${data.milis}.pdf`
                          },
                          {
                            where: {
                              id: {
                                [Op.eq] : addOrder.id
                              }
                            }
                        })
                      }else{
                        res.status(201).json({
                          message:error.message,
                          data:{},
                          status:0
                        })
                        return
                      }
                    }catch(error){
                      res.status(500).json({
                        message:error.message,
                        data:{},
                        status:0
                      })
                    }
                  }
              // console.log('allTotal',allTotal)
              // console.log('token',token)
              let orderId = randtoken.generate(4);
              // `source` is obtained with Stripe.js; see https://stripe.com/docs/payments/accept-a-payment-charges#web-create-token
              await stripe.charges.create({
                  amount: (allTotal*100),
                  currency: "usd",
                  source: "tok_mastercard", // obtained with Stripe.js
                  metadata: {'order_id': orderId},
                  description: 'Example charge',
                  shipping: {
                    name: 'Jenny Rosen',
                    address: {
                      line1: '510 Townsend St',
                      postal_code: '98140',
                      city: 'San Francisco',
                      state: 'CA',
                      country: 'US',
                    },
                  },
                },
                async function(err, charge) {
                  
                  // console.log(charge)
                  try {
                    let resultDetele = UserCart.destroy({
                      where:[{
                        user_id : {
                          [Op.eq] : user_id
                        }
                      }]
                    })
                    res.status(200).json({
                      message:'Order placed successfully.',
                      data:{},
                      status:1
                    })
                  } catch (error) {
                    res.status(500).json({
                      message:error.message,
                      data:{},
                      status:0
                    })
                  }
                }
              );

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
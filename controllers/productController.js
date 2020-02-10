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

router.post('/getproducts', async function(req, res) {
  try {
    const schema = Joi.object().keys({
      user_id:Joi.number().required(),
    }).with('group_name',['user_ids']).without('category_id','color_id');
    try {
      const value = await schema.validateAsync({user_id:req.body.user_id});
      const { user_id,category_id,color_id,sort_by } = req.body;
      
      // if category id added then category 
      // filter applied
      let where = []
      where.push({
        is_deleted:{
          [Op.eq] : 'no'
        }
      })
      if(category_id){
        where.push({
          category_id:category_id
        })
      }
      let colorsWhereClause = []
      colorsWhereClause.push({
        is_deleted:{
          [Op.eq] : 'no'
        }
      })

      // if color id added then color 
      // filter applied
      if(color_id){
        colorsWhereClause.push({
          color_id:color_id
        })
      }
      if(sort_by){
        var order =  [['price', sort_by]]
      }
      let productData = await Products.findAll({
        attributes:['id','name','price','features','image'],
        where:where,
        include:[
          {
            model:Productcolors,
            attributes:['id','color'],
            where:colorsWhereClause
          }
        ],
        order:order
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

router.post('/getproductdetailbyid', async function(req, res) {
  try {
    const schema = Joi.object().keys({
      user_id:Joi.number().required(),
    }).with('',['user_ids']).without('category_id','color_id');
    try {
      const value = await schema.validateAsync({user_id:req.body.user_id});
      const { product_id } = req.body;
      
      let productData = await Products.findOne({
        attributes:['id','name','price','features','image',
                  [Sequelize.literal(`(SELECT AVG(ratings) FROM tbl_product_ratings where product_id = `+product_id+`)`), 'ratings']
      ],
        where:[{
          is_deleted:{
            [Op.eq] : 'no'
          },
          id : {
            [Op.eq] : product_id
          }
        }],
        include:[
          {
            model:ProductImages,
            attributes:['id','image'],
            where:[{
              is_deleted:{
                [Op.eq] : 'no'
              }
            }],
            required:false
          },
          {
            model:Productcolors,
            attributes:['id','product_image_id'],
            where:[{
              is_deleted:{
                [Op.eq] : 'no'
              },
              product_id:{
                [Op.eq] : product_id
              }
            }],
            required:false,
            include:[{
              model:Colors,
              attributes:['id','color']
            }]
          },
        ],
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

//ratting products
router.post('/productsratting', async function(req, res) {
  try {
    const schema = Joi.object().keys({
      user_id:Joi.number().required(),
      product_id:Joi.number().required(),
      ratings:Joi.number().required(),
    });
    try {
      const value = await schema.validateAsync({
        user_id:req.body.user_id,
        product_id:req.body.product_id,
        ratings:req.body.ratings
      });
      const { product_id,user_id,ratings } = req.body;
      var productsRatingUser = await Ratings.findOne({
        where:{
          product_id : {
            [Op.eq] : product_id
          },
          user_id : {
            [Op.eq] : user_id
          }
        },
        raw: true,
      })
      
      if(productsRatingUser){
        try {
          
          let updRatings = await Ratings.update(
            {
              ratings:ratings
            },
            {
              where: {
                user_id: {
                  [Op.eq] : user_id
                },
                product_id:{
                  [Op.eq] : product_id
                }
              }}
          )
          if(updRatings){
            try {
              let averageRattingsProduct = await Ratings.findOne({
                  attributes : ['id',[Sequelize.literal(`(SELECT AVG(ratings) FROM tbl_product_ratings where product_id = `+product_id+`)`), 'ratings']],
                  where:{
                    product_id : {
                      [Op.eq] : product_id
                    }
                  }
              })
              res.status(200).json({
                message:'rattings given successfully',
                data:{averageRattingsProduct},
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
        } catch (error) {
          res.status(500).json({
            message:error.message,
            data:{},
            status:0
          })
        }
      }
      let addRatings = await Ratings.create({ 
        user_id:user_id,
        product_id:product_id,
        ratings:ratings
      });
      if(addRatings){
        try {
          let averageRattingsProduct = await Ratings.findOne({
              attributes : ['id',[Sequelize.literal(`(SELECT AVG(ratings) FROM tbl_product_ratings where product_id = `+product_id+`)`), 'ratings']],
              where:{
                product_id : {
                  [Op.eq] : product_id
                }
              }
          })
          res.status(200).json({
            message:'rattings given successfully',
            data:{averageRattingsProduct},
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
    } catch (error) {
      res.status(500).json({
        message:error.message,
        data:{},
        status:0
      })
    }    
  } catch (error) {
    res.status(500).json({
      message:error.message,
      data:{},
      status:0
    })
  }
})

router.post('/getproductcolor', async function(req, res) {
  try {
    const schema = Joi.object({
      user_id:Joi.number().required()
    })
    try {
      const value = await schema.validateAsync({user_id:req.body.user_id});
      const { user_id } = req.body;
      let colorData = await Colors.findAll({
        attributes:['id','color'],
        where:[{
          is_deleted:{
            [Op.eq] : 'no'
          }
        }],
        distinct: true
      })
      if(colorData.length == 0){
        res.status(200).json({
          message:'Products color not found',
          data:{},
          status:0
        })
        return
      }else{
        res.status(200).json({
          message:'Products color founds',
          data:{colorData},
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

router.post('/getproductcategories', async function(req, res) {
  try {
    const schema = Joi.object({
      user_id:Joi.number().required()
    })
    try {
      const value = await schema.validateAsync({user_id:req.body.user_id});
      const { user_id } = req.body;
      let categoryData = await Category.findAll({
        attributes:['id','name'],
        where:[{
          is_deleted:{
            [Op.eq] : 'no'
          }
        }],
        distinct: true
      })
      if(categoryData.length == 0){
        res.status(200).json({
          message:'Category not found',
          data:{},
          status:0
        })
        return
      }else{
        res.status(200).json({
          message:'Category color founds',
          data:{categoryData},
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

//this function is for add cart to products
router.post('/addtocartproduct', async function(req, res) {
  try {
    const schema = Joi.object({
      user_id:Joi.number().required(),
      product_id:Joi.number().required(),
      total_item:Joi.number().required(),
      product_color_id:Joi.number().required(),
      product_image_id:Joi.number().required(),
    })
    try {
      const value = await schema.validateAsync({
        user_id:req.body.user_id,
        product_id:req.body.product_id,
        total_item:req.body.total_item,
        product_color_id:req.body.product_color_id,
        product_image_id:req.body.product_image_id,
      });
      const { user_id,product_id,total_item,product_color_id,product_image_id } = req.body;
      try {
        let getCartDetails = await UserCart.findOne({
          attributes:['id','total_item'],
          where:[
            {
              user_id:{
                [Op.eq]:user_id
              }
            },
            {
              product_id:{
                [Op.eq]:product_id
              }
            },
            {
              product_image_id:{
                [Op.eq]:product_image_id
              }
            }
          ]
        })
        console.log('getCartDetails',getCartDetails)
        if(getCartDetails){
          let itemAddedNumber = getCartDetails.total_item
          let updatedItem = parseInt(itemAddedNumber) + total_item
          // console.log(updatedItem)
          // return
          let updCartData = await UserCart.update({
            total_item: updatedItem
          },
          {
            where: [
              {
                user_id:{
                  [Op.eq]:user_id
                }
              },
              {
                product_id:{
                  [Op.eq]:product_id
                }
              },
              {
                product_image_id:{
                  [Op.eq]:product_image_id
                }
              }
            ]
          })
          let getTotalItems = await UserCart.findOne({
            attributes:[[Sequelize.fn('count', Sequelize.col('id')), 'total_item']],
            where:[{
              user_id:{
                [Op.eq] : user_id
              }
            }],
            row:true
          });
          console.log('getTotalItems',getTotalItems.total_item)
          res.status(200).json({
            message:'Cart updated successfully',
            data:{total_item:getTotalItems.total_item,is_item_repeted:'yes'},
            status:1
          })
        }else{
            let addToCartRes = await UserCart.create({
              total_item:total_item,
              product_color_id:product_color_id,
              user_id:user_id,
              total_item:total_item,
              product_id:product_id,
              product_image_id:product_image_id
            })
            if(addToCartRes){
              let getTotalItems = await UserCart.findOne({
                attributes:[[Sequelize.fn('count', Sequelize.col('id')), 'total_item']],
                where:[{
                  user_id:{
                    [Op.eq] : user_id
                  }
                }],
                row:true
              });
              console.log('getTotalItems',getTotalItems.total_item)
              res.status(200).json({
                message:'Cart updated successfully',
                data:{total_item:getTotalItems.total_item,is_item_repeted:'no'},
                status:1
              })
            }else{
              res.status(500).json({
                message:"Something went wrong",
                data:{},
                status:0
              })  
            }
          console.log("not getting data")
        }
        // let addToCartRes = await UserCart.create({
        //   total_item:total_item,
        //   product_color_id:product_color_id,
        //   user_id:user_id,
        //   total_item:total_item,
        //   product_id:product_id,
        //   product_image_id:product_image_id
        // })
        // if(addToCartRes){
        //   let getTotalItems = await UserCart.findOne({
        //     attributes:[[Sequelize.fn('count', Sequelize.col('id')), 'total_item']],
        //     where:[{
        //       user_id:{
        //         [Op.eq] : user_id
        //       }
        //     }],
        //     row:true
        //   });
        //   console.log('getTotalItems',getTotalItems.total_item)
        //   res.status(200).json({
        //     message:'Cart updated successfully',
        //     data:{total_item:getTotalItems.total_item},
        //     status:1
        //   })
        // }else{
        //   res.status(500).json({
        //     message:"Something went wrong",
        //     data:{},
        //     status:0
        //   })  
        // }
      } catch (error) {
        res.status(500).json({
          message:error.message,
          data:{},
          status:0
        })
      }
    } catch (error) {
      res.status(500).json({
        message:error.message,
        data:{},
        status:0
      })
    }
  } catch (error) {
    res.status(500).json({
      message:error.message,
      data:{},
      status:0
    })
  }
})
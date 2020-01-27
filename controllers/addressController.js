'use strict';
var express = require('express')
var router = express.Router()
module.exports = router;

const constant  = require('../assets/constant')
const Products = require('../models/sequelizeModule').tbl_product
const Orders = require('../models/sequelizeModule').tbl_orders
const Productcolors = require('../models/sequelizeModule').tbl_product_colors
const ShippingAddresses = require('../models/sequelizeModule').tbl_shipping_address

const Sequelize = require('sequelize')
const Op = Sequelize.Op;
const Joi = require('@hapi/joi');

router.post('/getaddress', async function(req, res) {
    try {
      const schema = Joi.object({
        user_id:Joi.number().required()
      })
      try {
        const value = await schema.validateAsync({user_id:req.body.user_id});
        const { user_id } = req.body;
        let addressData = await ShippingAddresses.findAll({
          attributes:['id','address','is_default','createdAt'],
          where:[{
                user_id:{
                  [Op.eq] : user_id
                }
              }],
          order:[['id','desc']]    
        })
        if(addressData.length == 0){
          res.status(201).json({
            message:'You have not added any addresses',
            data:{},
            status:0
          })
          return
        }else{
          res.status(200).json({
            message:'address founds',
            data:{addressData},
            status:1
          })
        }
      }catch(error){
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

router.post('/getaddressdetailsbyid', async function(req, res) {
  try {
    const schema = Joi.object({
      address_id:Joi.number().required()
    })
    try {
      const value = await schema.validateAsync({address_id:req.body.address_id});
      const { address_id } = req.body;
      let addressData = await ShippingAddresses.findOne({
        attributes:['id','address','is_default','createdAt'],
        where:[{
              id:{
                [Op.eq] : address_id
              }
            }],
        order:[['id','desc']]    
      })
      if(addressData.length == 0){
        res.status(201).json({
          message:'You have not added any addresses',
          data:{},
          status:0
        })
        return
      }else{
        res.status(200).json({
          message:'address found',
          data:{addressData},
          status:1
        })
      }
    }catch(error){
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

//deletes address and set next address to default address
router.post('/delete', async function(req, res) {
    try {
        const schema = Joi.object({
            address_id:Joi.number().required(),
            user_id:Joi.number().required(),
        })
        try {
            const value = await schema.validateAsync({address_id:req.body.address_id,user_id:req.body.user_id});
            const { address_id,user_id } = req.body;
            let addressData = await ShippingAddresses.findAll({
              attributes:['id'],
              where:[{
                    id:{
                      [Op.eq] : address_id
                    }
                  }],
            })
            if(addressData.length == 0){
              res.status(201).json({
                message:'Addresses not found',
                data:{},
                status:0
              })
              return
            }else{
                try {
                    let addressData = await ShippingAddresses.findAll({
                        attributes:['id'],
                      })
                    // console.log(addressData[1].dataValues.id)
                    if(addressData.length>1 && addressData[0].dataValues.is_default == 'yes'){
                        let new_id = addressData[1].dataValues.id
                        console.log(new_id)
                        //update profile image
                            var updProfileImage = await ShippingAddresses.update(
                            {is_default:'yes' },
                            {returning: true,
                                where: 
                                {id: new_id}},
                        )
                    }
                    try {
                        let deleteAddress = await ShippingAddresses.destroy({
                            where:[{
                                  id:{
                                    [Op.eq] : address_id
                                  }
                                }],
                        })
                        if(deleteAddress){
                            res.status(200).json({
                                message:'Address deleted successfully',
                                data:{},
                                status:1
                            })
                        }else{
                            res.status(200).json({
                                message:'something is wrong',
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
                } catch (error) {
                    res.status(201).json({
                        message:error.message,
                        data:{},
                        status:0
                    })
                }
            }
        }catch(error){
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

//add shipping address
router.post('/addaddress', async function(req, res) {
  try {
    const schema = Joi.object({
      user_id:Joi.number().required(),
      address:Joi.string().required(),
    })
    try {
      const value = await schema.validateAsync({user_id:req.body.user_id,address:req.body.address});
      const { user_id,address } = req.body;
      let addressData = await ShippingAddresses.findAll({
        attributes:['id','address','is_default','createdAt'],
        where:[{
              user_id:{
                [Op.eq] : user_id
              }
            }],
      })
      let default_address
      if(addressData.length == 0){
        default_address = 'yes'
      }else{
        default_address = 'no'
      }
      let addAddress = await ShippingAddresses.create({ 
        address:address,
        default_address:default_address,
        user_id:user_id
      });
      if(addAddress){
        res.status(200).json({
          message:'Address added successfully.',
          data:{},
          status:1
        })
      }else{
        res.status(201).json({
          message:'Something wrong',
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
  } catch (error) {
    res.status(201).json({
      message:error.message,
      data:{},
      status:0
    })
  }
}) 

//edit address 
router.post('/editaddress', async function(req, res) {
  try {
    const schema = Joi.object({
      user_id:Joi.number().required(),
      address:Joi.string().required(),
      address_id:Joi.number().required()
    })
    try {
      const value = await schema.validateAsync({user_id:req.body.user_id,address_id:req.body.address_id,address:req.body.address});
      const { user_id,address,address_id } = req.body;

      try {
        let updData = await ShippingAddresses.update(
          {
            address: address
          },
          {
            where: {
              id: {
                [Op.eq] : address_id
              }
            }}
        )
        if(updData){
          res.status(200).json({
            message:'Address updated successfully.',
            data:{},
            status:1
          })
        }else{
          res.status(201).json({
            message:'Something wrong',
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

//set default address
router.post('/setdefaultaddress', async function(req, res) {
  try {
    const schema = Joi.object({
      user_id:Joi.number().required(),
      address_id:Joi.number().required()
    })
    try {
      const value = await schema.validateAsync({user_id:req.body.user_id,address_id:req.body.address_id});
      const { user_id,address_id } = req.body;

      try {
        let updData = await ShippingAddresses.update(
          {
            is_default: 'yes'
          },
          {
            where: {
              id: {
                [Op.eq] : address_id
              }
            }}
        )
        let updDataNoDefault = await ShippingAddresses.update(
          {
            is_default: 'no'
          },
          {
            where: {
              id: {
                [Op.not] : address_id
              }
            }}
        )
        if(updData){
          res.status(200).json({
            message:'Address updated successfully.',
            data:{},
            status:1
          })
        }else{
          res.status(201).json({
            message:'Something wrong',
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
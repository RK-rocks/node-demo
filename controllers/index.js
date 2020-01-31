'use strict';
const express = require('express');
const router = express()
module.exports = router;

const userController = require('./userController');
const orderController = require('./orderController')
const addressController = require('./addressController')
const productController = require('./productController')
const cartController = require('./cartController')
const checkoutController = require('./checkoutController')
const orderPdfController = require('./orderPdfController')
const joi  = require('joi')

var UserModel = require('../models/sequelizeModule').tbl_user

async function validateAPIKey(req, res, next){

    try {

        var header = req.headers['x_api_key'];
        var data = await authentication.findOne({
            where: {
                auth_key: header
            }
        });

        if (data != null) {
            next()
        }else{
            res.json({
                success: '0',
                message: 'plz send valid x_api_key key',
                data: {}
            })
        }

        

    } catch (err) {
        res
        .status(500)
        .json({ success: 0, data: {}, message: err.message })
    }
}

async function validateAPIKeyAndTokenForUser(req, res, next){

    try {
        const schema = joi.object().keys({
            x_api_key:joi.string().required(),
            access_token:joi.string().required(),
            device_token:joi.string().required().allow(''),
            version:joi.string().required().allow(''),
            user_id:joi.string().required(),
        }).with('x_api_key',['access_token','device_token','version','user_id']).options({ stripUnknown: true });
        joi.validate(req.headers, schema, async function (err, value) {
    
        try {

            if (err !== null) {
                res.status(500).json({
                    message: err.message,
                    success: 0,
                    data: {}
                })
                return
            }

            var x_api_key = req.headers['x_api_key'];
            var access_token = req.headers['access_token'];
            var device_token = req.headers['device_token'];
            var user_id = req.headers['user_id'];
            var version = req.headers['version'];
            
            var objAccesstokenUserModel = await AccesstokenModel.findOne({
                where: {
                    access_token: access_token,
                    user_id:user_id
                },
                include: [{model : authentication, where : {auth_key: x_api_key}}],
            });

            if (objAccesstokenUserModel != null) {
                await objAccesstokenUserModel.update({device_token : device_token,version:version})
                next()
            }else{
                res.status(401).json({
                    success: '0',
                    message: 'Unauthorized access',
                    data: {}
                })
            }
            
        } catch (e) {
            res.status(500).json({
                success: 0,
                message: e.message,
                data: {}
            })
        }
    
        });

    } catch (err) {
        res
        .status(500)
        .json({ success: 0, data: {}, message: err.message })
    }
}

router.use('/user',userController)
router.use('/order',orderController)
router.use('/address',addressController)
router.use('/product',productController)
router.use('/cart',cartController)
router.use('/checkout',checkoutController)
router.use('/pdfdownload',orderPdfController)

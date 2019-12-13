var express = require('express');
var router  = express.Router();

const userController = require('../controllers/userController')
const commonController = require('../controllers/commonController')

router.use('/user',userController)
router.use('/common',commonController)
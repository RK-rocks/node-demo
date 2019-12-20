'use strict';
var randtoken = require('rand-token')
var express = require('express')
var router = express.Router()
module.exports = router;

const passportJWT = require('passport-jwt');
const jwt = require('jsonwebtoken');
const multer  = require('multer')
const upload = multer()
const joi  = require('joi')
const constant  = require('../assets/constant')
const passport      = require('passport');
const pe            = require('parse-error');

let ExtractJwt = passportJWT.ExtractJwt;
let JwtStrategy = passportJWT.Strategy;

let jwtOptions = {};
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
jwtOptions.secretOrKey = 'wowwow';

var User = require('../models/sequelizeModule').tbl_user
const EmailTemplate = require('../models/sequelizeModule').tbl_email_templates
const Products = require('../models/sequelizeModule').tbl_product
const Orders = require('../models/sequelizeModule').tbl_orders
const Productcolors = require('../models/sequelizeModule').tbl_product_colors

const path = require('path')
var fs2 = require('fs');
var fs = require('fs-extra')

const Sequelize = require('sequelize')
const Op = Sequelize.Op;
const Joi = require('@hapi/joi');
const sendMail = require('./commonController').sendMail
var randtoken = require('rand-token');


//For storingImages
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/groupIcon')
    },
    filename: function (req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Only image files are allowed!'));
        }
        //cb(null, Date.now() + randtoken.uid(16) + path.extname(file.originalname)) //Appending extension
        cb(null, file.originalname) //Appending extension
    }
})

var uploadGroupPhoto = multer({

    dest: 'uploads/groupIcon',
    limits: {
        fieldNameSize: 100,
        fileSize: Const_group_Upload_Size
    },
    storage: storage

}).single('group_icon')

router.post('/register',async function(req, res, next) {
    try {
      const schema = Joi.object({
        first_name:Joi.string().required(),
        last_name:Joi.string().required(),
        mobileNo:Joi.string().required(),
        password: Joi.string().required(),
        email: Joi.string().required(),
      })
      try {
        const value = await schema.validateAsync(
          {
            first_name:req.body.firstName,
            last_name:req.body.lastName,
            mobileNo:req.body.mobileNo,
            password:req.body.password,
            email:req.body.email,
          }
        );
        
        const { mobileNo, password } = req.body;
        if (mobileNo && password) {
          try {
            let user = await getUser({ mobile_no: mobileNo,email:req.body.email });
            if (user) {
              res.status(201).json({
                message:'user already exists',
                data:{},
                status:0
              })
              return
            }
            let first_name = req.body.firstName
            let last_name = req.body.lastName
            let email = req.body.email
            let mobile_no = req.body.mobileNo
            let password = req.body.password
            try {
              
              let user = await createUser({ 
                first_name: first_name,
                last_name: last_name,
                email: email,
                mobile_no:mobile_no,
                password:password,
              });
              
              res.status(200).send({
                message:'User created successfully.',
                data:{},
                status:1
              })
            } catch (error) {
              res.status(201).json({
                message:error.message,
                data:{},
                status:0
              })
            }
          }catch(error) {
            res.status(201).json({
              message:error.message,
              data:{},
              status:0
            })
          }
      } 
    } catch (error) {
      res.status(201).json({
        message:error.message,
        data:{},
        status:0
      })
    }
  }catch (error) {
    res.status(201).json({
      message:error.message,
      data:{},
      status:0
    })
  }
})

router.post('/forgotpassword',async function(req, res, next) {
  try {
    const schema = Joi.object({
      email: Joi.string().required(),
    })
    const value = await schema.validateAsync({
      email:req.body.email,
    })
    try {
      // Generate a 16 character alpha-numeric token:
      var token = randtoken.generate(116);
      const { email } = req.body
      try {
        let user = await getUser({ email:req.body.email });
        if (!user) {
          res.status(201).json({
            message:'user does not exists',
            data:{},
            status:0
          })
          return
        }
        try {
          await User.update(
            {
              fp_id: token
            },
            {
              where: {
                email: {
                  [Op.eq] : email
                }
              }}
          )
          try {
            let subject = 'Forgot password'
            try {
              let html = await EmailTemplate.findOne({
                where:{
                  id : {
                    [Op.eq]:1
                  }
                }
              })
              let link = 'http://localhost:4200/reset-password'+'/'+token
              let emailBody = html.html.toString()
              var body = emailBody.replace('{EMAIL}',email)
              body = body.replace('{RESETLINNK}',link)
              sendMailr = await sendMail(email,body,subject)
              if(sendMailr){
                res.status(200).send({
                  message:'Reset password link is sent to this email address.',
                  data:{},
                  status:1
                })
              }else{
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
  } catch (error) {
    res.status(201).json({
      message:error.message,
      data:{},
      status:0
    })
  }
})

router.post('/checkfptoken',async function (req,res,next) {
  try {
    const schema = Joi.object({
      token: Joi.string().required(),
    })
    const value = await schema.validateAsync({
      token:req.body.token,
    })
    try {
      let {token} = req.body
      let userToken = await User.findOne({
        where:{
          fp_id : {
            [Op.eq]:token
          }
        }
      })
      if(userToken){
        res.status(200).json({
          message:'Right token',
          data:{},
          status:1
        })
        return
      }else{
        res.status(201).json({
          message:'wrong token',
          data:{},
          status:0
        })
        return
      }
    }catch(error){
      res.status(201).json({
        message:error.message,
        data:{},
        status:0
      })
    }
  }catch(error){
    res.status(201).json({
      message:error.message,
      data:{},
      status:0
    })
  }
})

router.post('/resetpassword',async function (req,res,next){
  try {
    const schema = Joi.object({
      token: Joi.string().required(),
      newPassword : Joi.string().required()
    })
    const value = await schema.validateAsync({
      token:req.body.token,
      newPassword : req.body.newPassword
    })
    try {
      let {token,newPassword} = req.body
      let userToken = await User.findOne({
        where:{
          fp_id : {
            [Op.eq]:token
          }
        }
      })
      if(!userToken){
        res.status(201).json({
          message:'token not found',
          data:{},
          status:0
        })
      }
      try {
        try {
          let updPassword = await User.update(
            {
              password: newPassword,
              fp_id:''
            },
            {
              where: {
                fp_id: {
                  [Op.eq] : token
                }
              }}
          )
          if(updPassword){
            res.status(200).json({
              message:'Password updated succsessfully.',
              data:{},
              status:1
            }) 
          }else{
            res.status(201).json({
              message:'something wrong.',
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

router.post('/changepassword',async function (req,res,next){
  try {
    const schema = Joi.object({
      user_id: Joi.number().required(),
      newPassword : Joi.string().required(),
      oldPassword: Joi.string().required(),
    })
    const value = await schema.validateAsync({
      user_id:req.body.user_id,
      newPassword : req.body.newPassword,
      oldPassword : req.body.oldPassword
    })
    try {
      let {user_id,newPassword,oldPassword} = req.body
      let userData = await User.findOne({
        where:{
          id : {
            [Op.eq]:user_id
          }
        }
      })
      if(!userData){
        res.status(201).json({
          message:'User not found',
          data:{},
          status:0
        })
      }
      try {
        console.log(userData.password)
        console.log(oldPassword)
        if(userData.password !== oldPassword){
          res.status(201).json({
            message:'You have enter wrong old password ',
            data:{},
            status:0
          })
          return
        }
        try {
          let updPassword = await User.update(
            {
              password: newPassword,
            },
            {
              where: {
                id: {
                  [Op.eq] : user_id
                }
              }}
          )
          if(updPassword){
            res.status(200).json({
              message:'Password updated succsessfully.',
              data:{},
              status:1
            }) 
            return
          }else{
            res.status(201).json({
              message:'something wrong.',
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

const getUser = async obj => {
  return await User.findOne({
    where:[{
      [Op.or]:{
        mobile_no:{
          [Op.eq] : obj.mobile_no
        },
        email : {
          [Op.eq] : obj.email
        }
      }
    }],
  });
};

const createUser=async obj =>{
  console.log(obj);
  first_name= obj.first_name
  last_name= obj.last_name
  email= obj.email
  mobile_no=obj.mobile_no
  password=obj.password
  return await User.create({
    first_name: first_name,
    last_name: last_name,
    email: email,
    mobile_no:mobile_no,
    password:password,
  });
}

//login route
router.post('/login', async function(req, res, next) {
  try {
    const schema = Joi.object({
      email:Joi.string().required(),
      password: Joi.string()
          .required(),
    })
    try {
      const value = await schema.validateAsync({email:req.body.email,password:req.body.password});
      console.log(req.body)
      const { email, password } = req.body;
      if (email && password) {
        try {
          let user = await getUser({ email: email });
          if (!user) {
            res.status(201).json({
              message:'No such user found',
              data:{},
              status:0
            })
            return
          }
          if (user.password === password) {
            // from now on we'll identify the user by the id and the id is the 
            // only personalized value that goes into our token
            let payload = { id: user.id };
            let token = jwt.sign(payload, jwtOptions.secretOrKey);
            const userData = {
              email:user.email,
              user_id:user.id,
              token:token
            }
            res.status(200).json({
              message:"Login successfully.",
              data:{userData},
              status:1
            })
          } else {
            res.status(201).json({
              message:"Password is incorrect",
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
});

router.post('/getUserDataById', async function(req, res, next) {
  try {
    const schema = Joi.object({
      id:Joi.number().required()
    })
    try {
      const value = await schema.validateAsync({id:req.body.id});
      console.log(value)
      const { id } = req.body;
      let userData = await User.findOne({
        attributes:['first_name','last_name'],
        where: {
          id : {
            [Op.eq]:id
          }
        }
      });
      if (!userData) {
        res.status(200).json({
          message:'No such user found',
          data:{},
          status:0
        })
        return
      }
      res.status(200).json({
        message:'user found',
        data:{userData},
        status:1
      })
    }catch(error){
      res.status(201).json({
        message:error.message,
        data:{},
        status:0
      })
    }
  }catch(error){
    res.status(201).json({
      message:error.message,
      data:{},
      status:0
    })
  }
})

router.post('/updateprofile', upload.none(),async function(req, res) {
  try {
    console.log(req.body)
    const schema = Joi.object({
      first_name:Joi.string().required(),
      last_name:Joi.string().required(),
      user_id:Joi.number().required()
    })
    try {
      const value = await schema.validateAsync({user_id:req.body.user_id,first_name:req.body.first_name,last_name:req.body.last_name});
      const { first_name,last_name,user_id } = req.body;
      let updProfile = await User.update(
        {
          first_name: first_name,
          last_name:last_name
        },
        {
          where: {
            id: {
              [Op.eq] : user_id
            }
          }}
      )
      if(updProfile){
        res.status(200).json({
          message:'Profile updated succsessfully.',
          data:{},
          status:1
        }) 
        return
      }else{
        res.status(201).json({
          message:'something wrong.',
          data:{},
          status:0
        })
      }
      res.status(200).json({
        message:'user found',
        data:{userData},
        status:1
      })
    }catch(error){
      res.status(201).json({
        message:error.message,
        data:{},
        status:0
      })
    }
  }catch(error){
    res.status(201).json({
      message:error.message,
      data:{},
      status:0
    })
  }
})

router.post('/getorders', async function(req, res) {
  try {
    const schema = Joi.object({
      user_id:Joi.number().required()
    })
    try {
      const value = await schema.validateAsync({user_id:req.body.user_id});
      const { user_id } = req.body;
      let orderData = await Orders.findAll({
        attributes:['id','order_id','total_item','createdAt'],
        include:[
          {
            model:Products,
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
          }
        ]
      })
      if(orderData.length == 0){
        res.status(201).json({
          message:'You have not ordered any items',
          data:{},
          status:0
        })
        return
      }else{
        res.status(200).json({
          message:'order founds',
          data:{orderData},
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

// protected route
router.get('/protected', passport.authenticate('jwt', { session: false }), function(req, res) {
  res.json('Success! You can now see this without a token.');
});

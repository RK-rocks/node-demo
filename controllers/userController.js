'use strict';
var randtoken = require('rand-token')
var express = require('express')
var router = express.Router()
module.exports = router;
var Jimp = require("jimp")
var fs = require('fs-extra')

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
const EmailTemplate = require('../models/sequelizeModule').tbl_email_template
const Products = require('../models/sequelizeModule').tbl_product
const Orders = require('../models/sequelizeModule').tbl_orders
const Productcolors = require('../models/sequelizeModule').tbl_product_colors
const ShippingAddresses = require('../models/sequelizeModule').tbl_shipping_address
const UserCart = require('../models/sequelizeModule').tbl_user_cart

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
      cb(null, 'uploads/original')
    },
    filename: function (req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Only image files are allowed!'));
        }
        // cb(null, Date.now() + randtoken.uid(16) + path.extname(file.originalname)) //Appending extension
        cb(null, file.originalname) //Appending extension
    }
})

var uploadUserPhoto = multer({

  dest: 'uploads/original',
  limits: {
      fieldNameSize: 10000000,
      fileSize: 60000000
  },
  storage: storage
}).single('profile_pic')

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

router.post('/loginwithsocialmedia',async function(req, res, next) {
  try {
    const schema = Joi.object({
      id:Joi.string().required(),
      login_with:Joi.string().required(),
      email:Joi.string().required(),
    })
    try {
      const value = await schema.validateAsync(
        {
          id:req.body.id,
          login_with:req.body.login_with,
          email:req.body.email
        }
      );
      console.log(req.body)
      const { id,email,login_with } = req.body;
      if (id) {
        try {
          let user = await getUser({ email: email });
          if(!user){
            let user = await User.create({ 
              email: email,
              login_with:login_with
            });
          }
          var is_subscribed = user.is_subscribed
          var getCartNumbers = await getCartItemNum({ user_id: user.id })
          console.log('getCartNumbers',getCartNumbers)
          
            // from now on we'll identify the user by the id and the id is the 
            // only personalized value that goes into our token
            let payload = { id: user.id };
            let token = jwt.sign(payload, jwtOptions.secretOrKey);
            const userData = {
              email:email,
              user_id:user.id,
              token:token,
              is_subscribed:is_subscribed,
              cart_item_numbers : getCartNumbers.total_item
            }

            try {
              let column_name
              switch (login_with) {
                case '1':
                  await User.update(
                    {
                      google_id: id
                    },
                    {
                      where: {
                        email: {
                          [Op.eq] : email
                        }
                      }}
                  )
                  break;
                case '2':
                  await User.update(
                    {
                      facebook_id: id
                    },
                    {
                      where: {
                        email: {
                          [Op.eq] : email
                        }
                      }}
                  )
                  break;

                case '3':
                  await User.update(
                    {
                      twitter_id: id
                    },
                    {
                      where: {
                        email: {
                          [Op.eq] : email
                        }
                      }}
                  )
                  break;
              
                default:
                  break;
              }
              res.status(200).json({
                message:"Login successfully.",
                data:{userData},
                status:1
              })
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
        let user = await User.findOne({ 
            where:[{
              email:{
                  [Op.eq] : req.body.email
                }
            }],
        });
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
              console.log("ljbjbjkbb")
              console.log(EmailTemplate)
              let html = await EmailTemplate.findOne({
                where:{
                  id : {
                    [Op.eq]:1
                  }
                }
              })
              console.log("jbjbjbkjbkj")
              let link = 'http://localhost:4200/reset-password'+'/'+token
              let emailBody = html.html.toString()
              var body = emailBody.replace('{EMAIL}',email)
              body = body.replace('{RESETLINNK}',link)
              const sendMailr = await sendMail(email,body,subject)
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

const getCartItemNum = async obj => {
  return await UserCart.findOne({
    attributes:[[Sequelize.fn('count', Sequelize.col('id')), 'total_item']],
    where:[{
      user_id:{
        [Op.eq] : obj.user_id
      }
    }],
  });
}

const createUser=async obj =>{
  console.log(obj);
  email= obj.email
  return await User.create({
    email: email
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

            var getCartNumbers = await getCartItemNum({ user_id: user.id })

            const userData = {
              email:user.email,
              user_id:user.id,
              token:token,
              is_subscribed:user.is_subscribed,
              cart_item_numbers : getCartNumbers.total_item
            }
            res.status(200).json({
              message:"Login successfully.",
              data:{userData},
              status:1
            })
          } else {
            res.status(201).json({
              message:"User email or password is incorrect.",
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
        attributes:['first_name','last_name','id','profile_image'],
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

router.post('/subscribemanage', async function(req, res, next) {
  try {
    const schema = Joi.object({
      id:Joi.number().required(),
      subscribe:Joi.string().required()
    })
    try {
      const value = await schema.validateAsync({id:req.body.id,subscribe:req.body.subscribe});
      console.log(value)
      const { id,subscribe } = req.body;
      let userData = await User.findOne({
        attributes:['first_name','last_name','id','profile_image'],
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
      let updProfile = await User.update(
        {
          is_subscribed:subscribe
        },
        {
          where: {
            id: {
              [Op.eq] : id
            }
          }}
      )
      if(updProfile){
        res.status(200).json({
          message:'change status succsessfully.',
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

router.post('/updateprofile', async function(req, res) {
  uploadUserPhoto(req, res,function (err) {
    console.log(err)
    try {
      const schama = joi.object().keys({
        first_name: joi.string().min(3).max(30).required(),
        last_name: joi.string().required(),
        user_id: joi.number().required(),
    }).with('first_name',['user_id','last_name']);
    joi.validate(req.body, schama, async function (err, value) {
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
        console.log(req.files)
        if (typeof req['file'] !== 'undefined') {
          Jimp.read(req.file.path,async function (err, img) {
              try{
                  if (err) throw err;
                  img.resize(256, 256)
                  .quality(60)
                  .write("uploads/original/" + user_id + "/" + "thumb_" + req.file.originalname);
                  // save
                  fs.move('uploads/original/' + req.file.originalname, 'uploads/original/' + user_id + '/' + req.file.originalname, function (err) {
                  if (err) throw err;
                  })
              }catch (e) {
                  res.status(500).json({
                      success: 0,
                      message: e.message,
                      data: {}
                  })   
              }
          })

          //update profile image
          var updProfileImage = await User.update(
              {profile_image: user_id + "/" + "thumb_" + req.file.originalname},
              {returning: true,where: {id: user_id}},
          )
      }
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
    })
    }catch(error){
      res.status(201).json({
        message:error.message,
        data:{},
        status:0
      })
    }
  })
})

// protected route
router.get('/protected', passport.authenticate('jwt', { session: false }), function(req, res) {
  res.json('Success! You can now see this without a token.');
});

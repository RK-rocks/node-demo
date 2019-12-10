const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');
// const bodyParser = require('jsonwebtoken');
const passportJWT = require('passport-jwt');
const jwt = require('jsonwebtoken');
const User = require('./models').tbl_user
const Joi = require('@hapi/joi');
// var controllers  = require('./controllers');
// This will be our application entry. We'll setup our server here.
const http = require('http');

const passport      = require('passport');
const pe            = require('parse-error');
const cors          = require('cors');

let ExtractJwt = passportJWT.ExtractJwt;
let JwtStrategy = passportJWT.Strategy;

let jwtOptions = {};
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
jwtOptions.secretOrKey = 'wowwow';

let strategy = new JwtStrategy(jwtOptions, function(jwt_payload, next) {
  console.log('payload received', jwt_payload);
  let user = getUser({ id: jwt_payload.id });

  if (user) {
    next(null, user);
  } else {
    next(null, false);
  }
});

// use the strategy
passport.use(strategy);

// Set up the express app
const app = express();
// Log requests to the console.
app.use(logger('dev'));
// Parse incoming requests data (https://github.com/expressjs/body-parser)

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// Setup a default catch-all route that sends back a welcome message in JSON format.
// app.get('*', (req, res) => res.status(200).send({
// message: 'Welcome to the beginning of nothingness.',
// }));

//Passport
app.use(passport.initialize());

app.use(cors({
  exposedHeaders: ['Content-Type']
}));

// route.use('/',controllers)

app.get('/user',(req,res) => {
    console.log(User)
    User.create({
        first_name: 'janedoe',
        last_name: 'janedoe',
        mobileNo:'87979979',
        address:'addressaddressaddressaddressaddressaddressaddress'
      })
      res.status(200).send({
        message: 'user created successfully.',
        })
})

const getUser = async obj => {
  return await User.findOne({
    where: obj,
  });
};

//login route
app.post('/login', async function(req, res, next) {
  try {
    const schema = Joi.object({
      mobileNo:Joi.string().required(),
      password: Joi.string()
          .required(),
    })
    try {
      const value = await schema.validateAsync({mobileNo:req.body.mobileNo,password:req.body.password});
      console.log(value)
      const { mobileNo, password } = req.body;
      if (mobileNo && password) {
        try {
          let user = await getUser({ mobile_no: mobileNo });
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

// protected route
app.get('/protected', passport.authenticate('jwt', { session: false }), function(req, res) {
  res.json('Success! You can now see this without a token.');
});

const port = parseInt(process.env.PORT, 10) || 8000;
app.set('port', port);
const server = http.createServer(app);
server.listen(port);
console.log("you can listen on port 8000")
console.log("you can hit http://localhost:8000")
module.exports = app;
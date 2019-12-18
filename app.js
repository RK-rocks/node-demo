const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const helmet = require('helmet');

var routes = require('./controllers/index'); 
var constant = require('./assets/constant'); 
const passport      = require('passport');
const pe            = require('parse-error');
const passportJWT = require('passport-jwt');
const jwt = require('jsonwebtoken');
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

//Passport


const app = express();
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization, x_api_key, user_id, token"
    );
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }
    next();
});

app.use(passport.initialize());

//Started Log on consol
if (Const_isDebug) {
    app.use(morgan('dev'))
}else{
    app.use(morgan('common', { skip: function(req, res) { return res.statusCode < 400 }}));
}


app.use(helmet())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use('/', routes)
app.set('port', process.env.PORT || 4060);

// catch 404 and forward to error handler
// note this is after all good routes and is not an error handler
// to get a 404, it has to fall through to this route - no error involved
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    res.status(404).json({ success: 0, data: {}, message: 'Api Not Found' })
    return;
 });
 
 
 // production error handler
 // no stacktrace leaked to user
 app.use(function (err, req, res, next) {
    res.status(500).json({ success: 0, data: {}, message: 'Server Error' })
    return;
 });


 
app.listen(app.get('port'), () => console.log('running on port ' + app.get('port')))

module.exports = app
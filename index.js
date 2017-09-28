const _ = require("lodash");
const express = require("express");
const bodyParser = require("body-parser");
const jwt = require('jsonwebtoken');

const passport = require("passport");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;

const app = express();

const users = [
    {
      id: 1,
      name: 'jonathanmh',
      password: '%2yx4'
    },
    {
      id: 2,
      name: 'test',
      password: 'test'
    }
]

const jwtOptions = {}
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
jwtOptions.secretOrKey = 'tasmanianDevil';

const strategy = new JwtStrategy(jwtOptions, function(jwt_payload, next) {
  console.log('payload received', jwt_payload);
  // usually this would be a database call:
  let user = users[_.findIndex(users, {id: jwt_payload.id})];
  if (user) {
    next(null, user);
  } else {
    next(null, false);
  }
});

passport.use(strategy);
app.use(passport.initialize());

// parse application/x-www-form-urlencoded
// for easier testing with Postman or plain HTML forms
app.use(bodyParser.urlencoded({
  extended: true
}));

// parse application/json
app.use(bodyParser.json())


app.get("/", (req, res) => {
  res.json({message: "Express is up!"});
});

app.post("/login", (req, res) => {
    if(req.body.name && req.body.password){
      var name = req.body.name;
      var password = req.body.password;
    }
    // usually this would be a database call:
    var user = users[_.findIndex(users, {name: name})];
    if( ! user ){
      res.status(401).json({message:"no such user found"});
    }

    if(user.password === req.body.password) {
      // from now on we'll identify the user by the id and the id is the only personalized value that goes into our token
      let payload = {id: user.id};
      let token = jwt.sign(payload, jwtOptions.secretOrKey);
      res.json({message: "ok", token: token});
    } else {
      res.status(401).json({message:"passwords did not match"});
    }
  });

  app.get("/secret", passport.authenticate('jwt', { session: false }), (req, res)=>{
    res.json("Success! You can not see this without a token");
  });
  

app.listen(3030, () => {
  console.log("Express running");
});
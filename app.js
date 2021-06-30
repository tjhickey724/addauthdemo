var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require( 'mongoose' );
const layouts = require("express-ejs-layouts");
const cors = require('cors');

//var configAuth = require('./config/auth');

const mongodb_URI = process.env.MONGODB_URI
console.log(`mongodb_URI = ${mongodb_URI}`)

const dbURL = mongodb_URI
// const dbURL = configAuth.dbURL
mongoose.connect(dbURL,{ useUnifiedTopology: true })

//mongoose.connect( 'mongodb://localhost/authDemo');



const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("we are connected!!!")
});

const User = require('./models/User');
const Data = require('./models/Data');

const authRouter = require('./routes/authentication');
const isLoggedIn = authRouter.isLoggedIn

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(layouts);
app.use(authRouter)
app.use(cors());

app.use('/', indexRouter);
app.use('/users', usersRouter);


app.get('/getData/:apikey',
  async (req,res,next) => {
    const apikey = req.params.apikey
    const data = await Data.findOne({apikey:apikey})
    console.log('in getData')
    console.log(data)
    //console.dir(data)
    if (data) {
      res.json(data.data)
    } else {
      res.json('error: no such apikey')
    }

  })

  app.get('/storeData/:apikey/:data',
    async (req,res,next) => {
      const apikey = req.params.apikey
      const data = req.params.data
      const newData = new Data({
        data:data,
        apikey:apikey
      })
      console.log('storing data='+data)
      await Data.deleteMany({apikey:apikey})
      await newData.save()
      res.json("done")

    })

  app.post('/storeData',
    async (req,res,next) => {
      const apikey = req.body.apikey
      const data = req.body.data
      const newData = new Data({
        data:data,
        apikey:apikey
      })
      await Data.deleteMany({apikey:apikey})
      await newData.save()
      res.json("done")

    })

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

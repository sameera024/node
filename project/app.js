var createError = require('http-errors');
var express = require('express');
var path = require('path');
var session = require("express-session");
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var user = require("./routes/users");

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var apis = require("./resources");

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(cookieParser());
app.use(session({
  secret: 'session key',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: true
  }
}))
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect("mongodb://localhost:27017/practice")
  .then(() => {
    console.log("connected to mongo");
  }).catch(() => {
    console.log("couldnt connect to mongo");
  })

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api', apis());
app.use("/user", user);
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

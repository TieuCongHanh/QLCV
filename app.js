var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const session = require('express-session');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/user');
var StaffRouter = require('./routes/staff');
var homeRouter=require('./routes/home');
var loandRouter=require('./routes/loand');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'KNDHA93sf2nfskfHNDHflsnr53jsg3hgsmdnsdg', // Chuỗi bí mật của bạn
  resave: false,
  saveUninitialized: true,
}));

app.use('/', homeRouter);
app.use('/home', homeRouter);
app.use('/user', usersRouter);
app.use('/staff', StaffRouter);
app.use('/loand', loandRouter);

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

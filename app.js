var express = require('express');
var createError = require('http-errors');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const { statusCodes } = require('http-status-codes');


var app = express();

//router
const usersRouter = require('./app/api/v1/users/router');


//make variable v1
const v1 = '/api/v1'



app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.status(statusCodes.OK).json({
    message: 'welcome to api semina',
  })
});


// console.log('first');

app.use(`${v1}`, usersRouter);

// console.log('second')
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
  console.log('error');
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  console.log('error');
  console.log(err);
  res.json(err);
});

module.exports = app;

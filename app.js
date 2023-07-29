var express = require('express');
var createError = require('http-errors');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const { statusCodes } = require('http-status-codes');


var app = express();

//router
const usersRouter = require('./app/api/v1/users/router');
const usersRefreshToken = require('./app/api/v1/userRefreshToken/router');
const thumbnailRouter = require('./app/api/v1/Thumbnail/router');
const productRouter = require('./app/api/v1/Products/router');


//make variable v1
const v1 = '/api/v1'

// middlewares handle error
const notFoundMiddleware = require('./app/middlewares/not-found');
const handleErrorMiddleware = require('./app/middlewares/handler-error');



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
app.use(`${v1}`, usersRefreshToken);
app.use(`${v1}`, thumbnailRouter);
app.use(`${v1}`, productRouter);

// console.log('second')
// catch 404 and forward to error handler
app.use(notFoundMiddleware);

// error handler
app.use(handleErrorMiddleware);

module.exports = app;

const express = require('express');
const createError = require('http-errors');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');


const app = express();

//router
const usersRouter = require('./app/api/v1/users/router');
const usersRefreshToken = require('./app/api/v1/userRefreshToken/router');
const thumbnailsRouter = require('./app/api/v1/Thumbnail/router');
const productsRouter = require('./app/api/v1/Products/router');
const transactionRouter = require('./app/api/v1/Transactions/router');
const midtransRouter = require('./app/api/v1/midtrans/router');
const googleAuthRouter = require('./app/api/v1/googleAuth/router');


//make variable v1
const v1 = '/api/v1'

// middlewares handle error
const notFoundMiddleware = require('./app/middlewares/not-found');
const handleErrorMiddleware = require('./app/middlewares/handler-error');


app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.json({
    message: 'welcome to api electra',
  })
});


// console.log('first');
app.use(`${v1}`, midtransRouter);
app.use(`${v1}`, googleAuthRouter);
app.use(`${v1}`, usersRouter);
app.use(`${v1}`, usersRefreshToken);
app.use(`${v1}`, thumbnailsRouter);
app.use(`${v1}`, productsRouter);
app.use(`${v1}`, transactionRouter);

// console.log('second')
// catch 404 and forward to error handler
app.use(notFoundMiddleware);

// error handler
app.use(handleErrorMiddleware);

module.exports = app;

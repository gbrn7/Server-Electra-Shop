const dotenv = require('dotenv');

dotenv.config();

module.exports = {
  urlDb: process.env.URL_MONGODB_DEV,
  jwtExpiration: process.env.JWT_EXPIRATION,
  jwtSecret: process.env.JWT_SECRET_KEY,
  jwtRefreshTokenSecret: process.env.JWT_SECRET_KEY_REFRESH_TOKEN,
  jwtRefreshTokenExpiration: process.env.JWT_EXPIRATION_REFRESH_TOKEN,
  gmail: process.env.GMAIL,
  pass: process.env.PASSWORD,
  MidtransServerKey: process.env.MIDTRANS_SERVER_KEY,
  MidtransClientKey: process.env.MIDTRANS_CLIENT_KEY,
  MidtransIsProduction: process.env.MIDTRANS_IS_PRODUCTION,
  RajaOngkirServerKey: process.env.RAJAONGKIR_SERVER_KEY,
  Google_Client_Id: process.env.GOOGLE_CLIENT_ID,
  Google_Client_Secret: process.env.GOOGLE_CLIENT_SECRET,
  Callback_Google_Url: process.env.CALLBACK_GOOGLE_URL,
};
const { StatusCodes } = require("http-status-codes");
const { chekingProductvailability, reduceProductStock } = require("../services/mongoose/products");

const CheckAvailProducts = async (req, res, next) => {
  try {
    await chekingProductvailability(req);

    next();
  } catch (error) {
    next(error);
  }
}

const reduceStockProduct = async (req, res, next) => {
  try {
    await reduceProductStock(req);

    next()
  } catch (error) {
    next(error);
  }
}
module.exports = {
  CheckAvailProducts,
  reduceStockProduct
}
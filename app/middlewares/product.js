const { chekingProductvailability, reduceProductStock } = require("../services/mongoose/products");

const CheckAvailProducts = async (req, res, next) => {
  try {
    const result = await chekingProductvailability(req);

    req.body.detailProducts = result;

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
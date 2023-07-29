const Products = require('../../api/v1/Products/model');
const { NotFoundError } = require('../../errors');

const getAllProducts = async (req) => {
  const { keyword, price, status, limit, page } = req.query;

  let condition = {};

  if (keyword) {
    condition = { ...condition, name: { $regex: keyword, $options: 'i' } };
  }
  if (price) {
    condition = { ...condition, name: { $regex: price, $options: 'i' } };
  }
  if (status) {
    condition = { ...condition, name: { $regex: status, $options: 'i' } };
  }

  const result = await Products.find(condition);


  if (!result || result.length === 0) throw new NotFoundError('Product not Found');

  const countProducts = await Products.countDocuments(condition);

  return { product: result, pages: Math.ceil(countProducts / limit), total: countProducts, page }
}

module.exports = {
  getAllProducts,
}
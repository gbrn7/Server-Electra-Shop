const Products = require('../../api/v1/Products/model');
const { NotFoundError, BadRequestError } = require('../../errors');
const { checkingThumbnail, destroyThumbnailById } = require('./thumbnail');
const fs = require('fs');

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

const createProduct = async (req) => {
  const {
    name,
    price,
    stock,
    desc,
    status,
    weight,
    thumbnail } = req.body;

  if (!thumbnail) throw new BadRequestError("The thumbnail is required");

  await checkingThumbnail(thumbnail);

  const result = await Products.create({
    name,
    price,
    stock,
    desc,
    status,
    weight,
    thumbnail
  });

  return result;
}

const updateProduct = async (req) => {
  const { id } = req.params;

  const check = await Products.findById(id).populate('thumbnail');

  if (!check) throw new NotFoundError(`The product with id ${id} not found`);

  const {
    name,
    price,
    stock,
    desc,
    status,
    weight,
    thumbnail } = req.body;

  if (thumbnail) {
    await checkingThumbnail(thumbnail);
    if (check.thumbnail._id.valueOf() !== thumbnail) {
      fs.unlinkSync(`public/${check.thumbnail.name}`);
      await destroyThumbnailById(check._id);
    }

  }

  const result = await Products.findByIdAndUpdate(id, {
    name,
    price,
    stock,
    desc,
    status,
    weight,
    thumbnail
  }, { new: true, runValidators: true });

  return result;
}

const findProduct = async (req) => {
  const { id } = req.params;

  const result = await Products.findById(id).populate('thumbnail');

  if (!result) throw new NotFoundError(`The product with id ${id} not found`);

  return result;
}

module.exports = {
  getAllProducts,
  createProduct,
  updateProduct,
  findProduct,
}
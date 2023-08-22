const Products = require("../../api/v1/Products/model");
const { NotFoundError, BadRequestError } = require("../../errors");
const { checkingThumbnail, destroyThumbnailById } = require("./thumbnail");

const getAllProducts = async (req) => {
  const { keyword, price, status, limit, page } = req.query;

  let condition = {};

  if (keyword) {
    condition = { ...condition, name: { $regex: keyword, $options: "i" } };
  }
  if (price) {
    condition = { ...condition, name: { $regex: price, $options: "i" } };
  }
  if (status) {
    condition = { ...condition, name: { $regex: status, $options: "i" } };
  }

  const result = await Products.find(condition).populate("thumbnail")
    .limit(limit)
    .skip(limit * (page - 1));

  // if (!result || result.length === 0)
  //   throw new NotFoundError("Product not Found");

  const countProducts = await Products.countDocuments(condition);

  return {
    products: result,
    pages: Math.ceil(countProducts / limit),
    total: countProducts,
    page,
  };
};

const createProduct = async (req) => {
  const { name, price, stock, desc, status, productSold, weights, thumbnail } =
    req.body;

  const product = new Products({
    name,
    price,
    stock,
    desc,
    status,
    productSold,
    weights,
    thumbnail,
  });

  const error = product.validateSync();
  if (error) {
    throw new BadRequestError(error);
  }

  //check thumbnail
  await checkingThumbnail(thumbnail);

  //save record
  await product.save();

  return product;
};

const updateProduct = async (req) => {
  const { id } = req.params;

  const product = await Products.findById(id).populate("thumbnail");

  if (!product) throw new NotFoundError(`The product with id ${id} not found`);

  const {
    name,
    price,
    stock,
    desc,
    status,
    productSold,
    weights,
    thumbnail } = req.body;

  const updatedProduct = await Products.findByIdAndUpdate(id, {
    name,
    price,
    stock,
    desc,
    status,
    productSold,
    weights,
    thumbnail
  }, { new: true, runValidators: true });

  return updatedProduct;
};

const findProduct = async (req) => {
  const { id } = req.params;

  const result = await Products.findById(id).populate("thumbnail");

  if (!result) throw new NotFoundError(`The product with id ${id} not found`);

  return result;
};

const deleteProduct = async (req) => {
  const { id } = req.params;

  const result = await Products.findByIdAndDelete(id).populate("thumbnail");

  if (!result) {
    throw new NotFoundError(`The product with id ${id} not found`);
  } else if (result?.thumbnail) {
    destroyThumbnailById(result.thumbnail);
  }

  return result;
};

const chekingProductAvailability = async (req) => {
  const { orderDetails } = req.body;

  const idProducts = orderDetails.map((item) => {
    return item.productId;
  });

  const checkingProduct = await Products.find({
    _id: { $in: idProducts },
  });

  if (!checkingProduct) throw new NotFoundError("The product not found");

  let err = [],
    totalBill = 0,
    totalWeight = 0;

  for (let i = 0; i < orderDetails.length; i++) {
    let idx = i;
    for (let j = i; j < checkingProduct.length; j++) {
      if (orderDetails[i].productId === checkingProduct[j]._id.valueOf()) {
        idx = j;
      }
    }
    //swap
    const temp = checkingProduct[i];
    checkingProduct[i] = checkingProduct[idx];
    checkingProduct[idx] = temp;
    //checking stock
    if (checkingProduct[i].stock < orderDetails[i].qty) {
      err.push(checkingProduct[i]);
    } else {
      totalBill += checkingProduct[i].price * orderDetails[i].qty;
      totalWeight += checkingProduct[i].weights * orderDetails[i].qty;
      checkingProduct[i].stock = orderDetails[i].qty;
    }
  }

  if (err.length !== 0) {
    throw new BadRequestError(
      `the stock of product with ${err
        .map((item) => `id: ${item._id} stock: ${item.stock}`)
        .join(", ")} is less than request`
    );
  } else {
    req.body.totalBill = totalBill;
    req.body.totalWeight = totalWeight;
  }

  return checkingProduct;
};

const reduceProductStock = async (req) => {
  const { orderDetails } = req.body;

  const result = await Products.bulkWrite(
    orderDetails.map((item) => {
      return {
        updateOne: {
          filter: { _id: item.productId },
          update: { $inc: { stock: -item.qty, productSold: item.qty } },
        },
      };
    })
  );
  return result;
};

const checkingRollbackProduct = async (oldData, newData) => {
  const idProducts = await newData.map((item) => {
    return item.productId;
  });

  const checkingProduct = await Products.find({
    _id: { $in: idProducts },
  });

  if (!checkingProduct) throw new NotFoundError("The product not found");

  let err = [];

  for (let i = 0; i < newData.length; i++) {
    for (let j = 0; j < oldData.length; j++) {
      if (
        oldData[j].productId.valueOf() === newData[i].productId &&
        oldData[j].productId.valueOf() === checkingProduct[i]._id.valueOf()
      ) {
        let check = checkingProduct[i].stock + oldData[j].qty - newData[i].qty;

        if (check < 0) {
          err.push(checkingProduct[i]);
        }

        break;
      }
    }
  }

  if (err.length !== 0) {
    throw new BadRequestError(
      `the stock of product with ${err
        .map((item) => `id: ${item._id} stock: ${item.stock}`)
        .join(", ")} is less than request`
    );
  }
};

module.exports = {
  getAllProducts,
  createProduct,
  updateProduct,
  findProduct,
  deleteProduct,
  chekingProductAvailability,
  reduceProductStock,
  checkingRollbackProduct,
};

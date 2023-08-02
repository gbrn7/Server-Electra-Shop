const Transactions = require('../../api/v1/Transactions/model');
const Products = require('../../api/v1/Products/model');
const { NotFoundError, BadRequestError } = require('../../errors');
const { checkingRollbackProduct } = require('./products');

const getAllTransaction = async (req) => {
  const { userId, limit, page, transaction_status } = req.query;

  let condition = {};

  if (userId) {
    condition = { ...condition, userId };
  } if (transaction_status) {
    condition = { ...condition, transaction_status: { $regex: transaction_status, $options: 'i' } };
  }

  const result = await Transactions.find(condition);

  if (!result || result.length === 0) throw new NotFoundError('transaction not Found');

  const countTransactions = await Transactions.countDocuments(condition);

  return { product: result, pages: Math.ceil(countTransactions / limit), total: countTransactions, page }
}

const createTransaction = async (req) => {
  const { userId } = req.user;

  const {
    address,
    total,
    expedition,
    transaction_status,
    orderDetails
  } = req.body;

  const result = await Transactions.create({
    userId,
    address,
    total,
    expedition,
    transaction_code: Math.floor(Math.random() * 99999999),
    transaction_status,
    orderDetails
  });

  return result;
}

const updateTransaction = async (req) => {
  const { id } = req.params;

  const check = await Transactions.findById(id);

  if (!check) throw new NotFoundError(`The product with id ${id} not found`);

  const {
    userId,
    address,
    total,
    expedition,
    transaction_code,
    transaction_status,
    orderDetails
  } = req.body;

  if (orderDetails) {
    await checkingRollbackProduct(check.orderDetails, orderDetails);

    for (let i = 0; i < check.orderDetails.length; i++) {
      if (check.orderDetails[i].productId.valueOf() === orderDetails[i].productId
        && check.orderDetails[i].qty !== orderDetails[i].qty) {
        try {
          await Products.bulkWrite([{
            updateOne: {
              filter: { _id: check.orderDetails[i].productId.valueOf() },
              update: { $inc: { stock: check.orderDetails[i].qty - orderDetails[i].qty } },
            },
          }]);
        } catch (error) {
          throw new BadRequestError(error);
        }
      } else if (check.orderDetails[i].productId.valueOf() !== orderDetails[i].productId) {
        throw new BadRequestError('The old orderDetail id and new orderDetail id is not the same')
      }
    }
  }

  const result = await Transactions.findByIdAndUpdate(id, {
    userId,
    address,
    total,
    expedition,
    transaction_code,
    transaction_status,
    orderDetails
  }, { new: true, runValidators: true });

  return result;
}

const findTransaction = async (req) => {
  const { id } = req.params;
  const result = Transactions.findById(id);

  if (!result) throw new NotFoundError(`The product with id ${id} not found`);

  return result;
}

const deleteTransaction = async (req) => {
  const { id } = req.params;

  const result = await Transactions.findByIdAndDelete(id);

  if (!result) throw new NotFoundError(`The product with id ${id} not found`);

  return result;
}

const getRevenueTrans = async (req) => {
  const revenue = Transactions.aggregate({
    $group: {
      grandTotal: { $sum: "" }
    }
  })
}

module.exports = {
  getAllTransaction,
  createTransaction,
  updateTransaction,
  findTransaction,
  deleteTransaction,
}
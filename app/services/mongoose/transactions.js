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

  console.log(condition);

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
    transactions_status,
    orderDetails
  } = req.body;

  const result = await Transactions.create({
    userId,
    address,
    total,
    expedition,
    transactions_code: Math.floor(Math.random() * 99999999),
    transactions_status,
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
    transactions_code,
    transactions_status,
    orderDetails
  } = req.body;

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

  const result = await Transactions.findByIdAndUpdate(id, {
    userId,
    address,
    total,
    expedition,
    transactions_code,
    transactions_status,
    orderDetails
  }, { new: true, runValidators: true });

  return result;
}

const findTransaction = async (req) => {
  const { id } = req.params;

  console.log(id);

  const result = Transactions.findById(id);

  if (!result) throw new NotFoundError(`The product with id ${id} not found`);

  return result;
}
module.exports = {
  getAllTransaction,
  createTransaction,
  updateTransaction,
  findTransaction,
}
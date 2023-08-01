const Transactions = require('../../api/v1/Transactions/model');
const { NotFoundError, BadRequestError } = require('../../errors');

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

  const result = await Transactions.create({
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
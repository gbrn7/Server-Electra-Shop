const Transactions = require('../../api/v1/Transactions/model');
const { NotFoundError, BadRequestError } = require('../../errors');

const getAllTransaction = async (req) => {
  const { keyword, limit, page } = req.query;

  let condition = {};

  if (keyword) {
    condition = { ...condition, userId: { $regex: keyword, $options: 'i' } };
  }

  const result = await Transactions.find(condition).populate('thumbnail');

  if (!result || result.length === 0) throw new NotFoundError('Product not Found');

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


module.exports = {
  getAllTransaction,
  createTransaction,
  updateTransaction,
}
const Transactions = require('../../api/v1/Transactions/model');
const Products = require('../../api/v1/Products/model');
const { NotFoundError, BadRequestError } = require('../../errors');
const { checkingRollbackProduct } = require('./products');
const { startOfDay } = require('date-fns')
const { endOfDay } = require('date-fns')
const { makeMidtrans } = require('../midtrans');
const { transactionInvoice } = require('../email');

const getAllTransaction = async (req) => {
  const {
    userId,
    limit,
    page,
    transaction_status,
    shipment_status,
    startDate,
    endDate, } = req.query;

  let condition = {};

  if (userId) {
    condition = { ...condition, userId };
  } if (transaction_status) {
    condition = { ...condition, transaction_status: { $regex: transaction_status, $options: 'i' } };
  } if (shipment_status) {
    condition = {
      ...condition, 'expedition.shipment_status': { $regex: shipment_status, $options: 'i' }
    };
  } if (startDate) {
    condition = {
      ...condition, updatedAt: {
        $gt: startOfDay(new Date(`${startDate}`)),
      }
    };
  } if (endDate) {
    condition = { ...condition, updatedAt: { $lt: endOfDay(new Date(`${endDate}`)) } };
  }

  const result = await Transactions.aggregate([{
    $match: condition
  }, {
    $project: {
      _id: 1,
      userId: 1,
      address: 1,
      expedition: 1,
      transaction_code: 1,
      transaction_status: 1,
      payment_link: 1,
      payment_token: 1,
      orderDetails: 1,
      createdAt: 1,
      updatedAt: 1,
      date: { $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" } },
    }
  }
  ]);

  if (!result || result.length === 0) throw new NotFoundError('transaction not Found');

  const countTransactions = await Transactions.countDocuments(condition);

  return { product: result, pages: Math.ceil(countTransactions / limit), total: countTransactions, page }
}

const createTransaction = async (req) => {
  const { userId } = req.user;

  const {
    address,
    totalBill,
    expedition,
    transaction_status,
    orderDetails
  } = req.body;

  const grandTotal = totalBill + expedition.courierDetail.costs.cost.value;

  req.body.grandTotal = grandTotal;
  // return req.body;

  const result = await Transactions.create({
    userId,
    address,
    total: grandTotal,
    expedition,
    transaction_code: Math.floor(Math.random() * 99999999),
    transaction_status,
    orderDetails
  });

  if (!result) throw new NotFoundError('Internal server error');

  const midtransResult = await makeMidtrans(result, req);

  if (midtransResult) {
    result.payment_link = midtransResult.redirect_url;
    result.payment_token = midtransResult.token;

    await result.save();

    req.body.payment_link = result.payment_link;
  } else {

    if (!result) throw new NotFoundError('Internal server error');
  }

  await transactionInvoice(req.user.email, req.body);

  return result;
  // return req.body;
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

      for (let j = 0; j < orderDetails.length; j++) {
        if (check.orderDetails[i].productId.valueOf() === orderDetails[i].productId
          && check.orderDetails[i].qty !== orderDetails[i].qty) {
          try {
            const diff = check.orderDetails[i].qty - orderDetails[i].qty;
            await Products.findByIdAndUpdate(check.orderDetails[i].productId.valueOf(), {
              $inc: { stock: diff, productSold: diff * -1 }
            });
            break;
          } catch (error) {
            throw new BadRequestError(error);
          }
        }

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

  if (!result) throw new NotFoundError('Internal server error');

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

const getRevenueTrans = async () => {
  const revenue = await Transactions.aggregate([{
    $group: {
      _id: null,
      grandTotal: { $sum: "$total" }
    }
  }])

  if (!revenue) throw new NotFoundError("Not Found Transactions");

  return revenue;
}

const getCountTransByStatus = async (req) => {
  const { transaction_status } = req.body;

  const countPendingRevenue = await Transactions.countDocuments({ transaction_status: { $regex: transaction_status, $options: 'i' } });

  if (!countPendingRevenue) throw new NotFoundError("Not Found Transactions");

  return countPendingRevenue;
}

const getHighestSalesProduct = async (req) => {

  const result = await Products.aggregate([{
    $project: {
      _id: 1,
      name: 1,
      stock: 1,
      price: 1,
      productSold: 1,
      total: { $multiply: ["$price", "$productSold"] }
    }
  }, {
    $sort: {
      total: -1
    }
  }, {
    $limit: 5
  }])

  if (!result) throw new NotFoundError('Internal server error');

  return result;
}

const getLowestSalesProduct = async (req) => {

  const result = await Products.aggregate([{
    $project: {
      _id: 1,
      name: 1,
      stock: 1,
      price: 1,
      productSold: 1,
      total: { $multiply: ["$price", "$productSold"] }
    }
  }, {
    $sort: {
      total: 1
    }
  }, {
    $limit: 5
  }])

  if (!result) throw new NotFoundError('Internal server error');

  return result;
}

const updateShipmentStatus = async (req) => {
  const { id } = req.params;
  const { shipment_status } = req.body;

  if (!shipment_status) throw new BadRequestError("provide the shipment status / delivery recipt from courier");

  const check = await Transactions.findById(id);

  if (!check) throw new NotFoundError(`The product with id ${id} not found`);

  const result = Transactions.findByIdAndUpdate(id, {
    'expedition.shipment_status': shipment_status
  }, { new: true, runValidators: true })

  if (!result) throw new NotFoundError('Internal server error');

  return result;
}


module.exports = {
  getAllTransaction,
  createTransaction,
  updateTransaction,
  findTransaction,
  deleteTransaction,
  getRevenueTrans,
  getCountTransByStatus,
  getHighestSalesProduct,
  getLowestSalesProduct,
  updateShipmentStatus,
}
const Transactions = require('../../api/v1/Transactions/model');
const Products = require('../../api/v1/Products/model');
const { NotFoundError, BadRequestError } = require('../../errors');
const { checkingRollbackProduct } = require('./products');
const { startOfDay, sub, format, eachMonthOfInterval, compareDesc } = require('date-fns')
const { endOfDay } = require('date-fns')
const { makeMidtrans } = require('../midtrans');
const { transactionInvoice } = require('../email');

const getAllTransaction = async (req) => {
  const {
    userId,
    transaction_status,
    shipment_status,
    startDate,
    endDate, } = req.query;

  let {
    limit = 5,
    page = 1
  } = req.query;


  let match = {};

  if (userId) {
    match = { ...match, userId };
  } if (transaction_status) {
    match = { ...match, transaction_status: { $regex: transaction_status, $options: 'i' } };
  } if (shipment_status) {
    match = {
      ...match, 'expedition.shipment_status': { $regex: shipment_status, $options: 'i' }
    };
  } if (startDate) {
    match = {
      ...match, updatedAt: {
        $gt: startOfDay(new Date(`${startDate}`)),
      }
    };
  } if (endDate) {
    match = { ...match, updatedAt: { $lt: endOfDay(new Date(`${endDate}`)) } };
  }

  const result = await Transactions.aggregate([{
    $match: match
  }, {
    $project: {
      _id: 1,
      userId: 1,
      total: 1,
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
  },
  {
    $sort: {
      _id: -1
    }
  },
  {
    $skip: parseInt(limit) * (parseInt(page) - 1)
  },
  {
    $limit: limit,
  }
  ]);

  if (!result || result.length === 0) throw new NotFoundError('transaction not Found');

  const countTransactions = await Transactions.countDocuments(match);

  return { transactions: result, pages: Math.ceil(countTransactions / limit), total: countTransactions, page }
}

const getSchedule = async (req) => {
  const {
    transaction_status,
    shipment_status,
    startDate,
    endDate
  } = req.query;

  let {
    limit = 3,
    page = 1
  } = req.query;


  let match = {};

  if (transaction_status) {
    match = { ...match, transaction_status: { $regex: transaction_status, $options: 'i' } };
  }

  if (shipment_status) {
    match = {
      ...match, 'expedition.shipment_status': { $regex: shipment_status, $options: 'i' }
    };
  } else {
    match = {
      ...match, 'expedition.shipment_status': { $not: { $regex: 'pending', $options: 'i' } }
    };
  }

  if (startDate) {
    match = {
      ...match, updatedAt: {
        $gt: startOfDay(new Date(`${startDate}`)),
      }
    };
  }

  if (endDate) {
    match = { ...match, updatedAt: { $lt: endOfDay(new Date(`${endDate}`)) } };
  }

  const result = await Transactions.aggregate([{
    $match: match
  },
  {
    $sort: {
      _id: -1
    }
  },
  {
    $skip: parseInt(limit) * (parseInt(page) - 1)
  },
  {
    $limit: parseInt(limit),
  }, {
    $unwind: {
      path: '$orderDetails'
    }
  },
  {
    $lookup: {
      from: 'products',
      localField: 'orderDetails.productId',
      foreignField: '_id',
      as: 'orderDetails.product'
    }
  },
  {
    $unwind: {
      path: '$orderDetails.product'
    }
  },
  {
    $group: {
      _id: '$_id',
      products: {
        $push: '$orderDetails'
      }
    }
  },
  {
    $lookup: {
      from: 'transactions',
      localField: '_id',
      foreignField: '_id',
      as: 'transaction'
    }
  },
  {
    $unwind: {
      path: '$transaction'
    }
  },
  {
    $addFields: {
      'transaction.orderDetails': '$products'
    }
  },
  {
    $replaceRoot: {
      newRoot: '$transaction'
    }
  }, {
    $lookup: {
      from: 'users',
      localField: 'userId',
      foreignField: '_id',
      as: 'userDetails'
    }
  }, {
    $unwind: '$userDetails'
  }, {
    $project: {
      _id: 1,
      userId: 1,
      total: 1,
      address: 1,
      expedition: 1,
      transaction_code: 1,
      transaction_status: 1,
      payment_link: 1,
      payment_token: 1,
      orderDetails: 1,
      createdAt: 1,
      updatedAt: 1,
      userDetails: 1,
      date: { $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" } },
    }
  },
  ]);

  if (!result || result.length === 0) throw new NotFoundError('transaction not Found');

  const countTransactions = await Transactions.countDocuments(match);

  return { transactions: result, pages: Math.ceil(countTransactions / limit), total: countTransactions, page };
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

  req.body.grandTotal = grandTotal.toLocaleString('de-De');

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
  const revenue = await Transactions.aggregate([
    {
      $match: {
        transaction_status: {
          $regex: 'success',
          $options: 'i'
        }
      }
    }
    , {
      $group: {
        _id: null,
        grandTotal: { $sum: "$total" }
      }
    }])

  if (!revenue) throw new NotFoundError("Not Found Transactions");

  return revenue;
}

const getCountTransByStatus = async (req) => {
  const {
    transaction_status,
    shipment_status } = req.query;

  let condition = {};

  if (transaction_status) {
    condition = { ...condition, transaction_status: { $regex: transaction_status, $options: 'i' } };
  }
  if (shipment_status) {
    condition = { ...condition, 'expedition.shipment_status': { $regex: shipment_status, $options: 'i' } };
  }

  const countTrans = await Transactions.countDocuments(condition);

  if (!countTrans) throw new NotFoundError("Not Found Transactions");

  return countTrans;
}

const getHighestSalesProduct = async () => {

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

const getLowestSalesProduct = async () => {

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

const getlastSevenDaysTrans = async () => {

  const startDate = sub(startOfDay(new Date()), {
    weeks: 1,
  })
  const endDate = endOfDay(new Date());

  const data = await Transactions.aggregate([{
    $match: {
      updatedAt: {
        $gt: startDate,
        $lt: endDate,
      },
      transaction_status: 'success',
    }
  }, {
    $group: {
      _id: {
        $dateToString: { format: "%Y, %m, %d", date: "$updatedAt" }
      },
      totalRevenue: { $sum: "$total" }
    }
  }])

  const result = [];

  for (let i = 0, j = 0; i < 7; i++) {
    const formatedDate = format(sub(new Date(), { days: i }), 'yyyy, MM, dd');
    if (formatedDate === data[j]?._id) {
      result.push({
        label: format(new Date(formatedDate), 'EEE yyyy, MM, dd'),
        data: data[j].totalRevenue
      })
      j++;
    } else {
      result.push({
        label: format(new Date(formatedDate), 'EEE yyyy, MM, dd'),
        data: 0,
      })
    }
  }

  return result;
}

const getlastOneYearTrans = async () => {

  const startDate = sub(startOfDay(new Date()), {
    years: 1,
  })
  const endDate = endOfDay(new Date());


  const data = await Transactions.aggregate([{
    $match: {
      updatedAt: {
        $gt: startDate,
        $lt: endDate,
      },
      transaction_status: 'success',
    }
  }, {
    $sort: {
      updatedAt: -1,
    }
  }, {
    $group: {
      _id: {
        $dateToString: { format: "%Y-%m", date: "$updatedAt" }
      },
      totalRevenue: { $sum: "$total" }
    }
  }])

  const result = [];
  for (let i = 0, j = 0; i < 12; i++) {
    const formatedDate = format(sub(new Date(), { months: i }), 'yyyy-MM');
    if (formatedDate === data[j]?._id) {
      result.push({
        label: format(new Date(formatedDate), 'MMM yyyy'),
        data: data[j].totalRevenue
      })
      j++;
    } else {
      result.push({
        label: format(new Date(formatedDate), 'MMM yyyy'),
        data: 0,
      })
    }
  }

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
  getlastSevenDaysTrans,
  getlastOneYearTrans,
  getSchedule,
}
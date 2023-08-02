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
          const diff = check.orderDetails[i].qty - orderDetails[i].qty;
          await Products.findByIdAndUpdate(check.orderDetails[i].productId.valueOf(), {
            $inc: { stock: diff, productSold: diff * -1 }
          });
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
  const result = await Transactions.aggregate([
    {
      $unwind: "$orderDetails"
    },
    {
      $lookup: {
        from: "products",
        localField: "orderDetails.productId",
        foreignField: "_id",
        pipeline: [{ $project: { "price": 1, "name": 1, "stock": 1, "total": { $multiply: ["$price", "$orderDetails.qty"] } } }],
        as: "product"
      }
    }, {
      $set: {
        "orderDetails.product": "$product"
      }
    }, {
      $group: {
        _id: "$_id",
        orderDetails: { $push: "$orderDetails" },
      }
    }
  ]);
  // const result = await Transactions.aggregate([
  //   {
  //     $group: {
  //       _id: "$orderDetails.productId",
  //       grandTotal: { $sum: "$total" }
  //     },
  //   },
  //   {
  //     $sort: {
  //       grandTotal: -1
  //     }
  //   },
  //   {
  //     $limit: 5
  //   }
  // ])

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
}
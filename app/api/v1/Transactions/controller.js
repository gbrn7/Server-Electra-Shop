const { StatusCodes } = require('http-status-codes');
const { createTransaction, getAllTransaction, findTransaction, updateTransaction, deleteTransaction, getRevenueTrans, getCountTransByStatus, getHighestSalesProduct, getLowestSalesProduct } = require('../../../services/mongoose/transactions');

const index = async (req, res, next) => {
  try {
    const result = await getAllTransaction(req);

    res.status(StatusCodes.OK).json({
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

const create = async (req, res, next) => {
  try {
    const result = await createTransaction(req);

    res.status(StatusCodes.CREATED).json({
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

const find = async (req, res, next) => {
  try {
    const result = await findTransaction(req);

    res.status(StatusCodes.OK).json({
      data: result,
    })
  } catch (error) {
    next(error);
  }
}

const update = async (req, res, next) => {
  try {
    const result = await updateTransaction(req);

    res.status(StatusCodes.OK).json({
      data: result,
    })
  } catch (error) {
    next(error);
  }
}

const destroy = async (req, res, next) => {
  try {
    const result = await deleteTransaction(req);

    res.status(StatusCodes.OK).json({
      data: result,
    })
  } catch (error) {
    next(error);
  }
}

const readRevenue = async (req, res, next) => {
  try {
    const result = await getRevenueTrans();

    res.status(StatusCodes.OK).json({
      data: result,
    })
  } catch (error) {
    next(error);
  }
}

const readCountTransByStatus = async (req, res, next) => {
  try {
    const result = await getCountTransByStatus(req);

    res.status(StatusCodes.OK).json({
      data: result,
    })
  } catch (error) {
    next(error);
  }
}

const readHighestSalesProduct = async (req, res, next) => {
  try {
    const result = await getHighestSalesProduct(req);

    res.status(StatusCodes.OK).json({
      data: result,
    })
  } catch (error) {
    next(error);
  }
}

const readLowestSalesProduct = async (req, res, next) => {
  try {
    const result = await getLowestSalesProduct(req);

    res.status(StatusCodes.OK).json({
      data: result,
    })
  } catch (error) {
    next(error);
  }
}

const readNewTransactions = async (req, res, next) => {
  try {
    const result = await getNewTransactions(req);

    res.status(StatusCodes.OK).json({
      data: result,
    })
  } catch (error) {
    next(error);
  }
}

const readNewSchedules = async (req, res, next) => {
  try {
    const result = await getNewSchedules(req);

    res.status(StatusCodes.OK).json({
      data: result,
    })
  } catch (error) {
    next(error);
  }
}

const updateShipment = async (req, res, next) => {
  try {
    const result = await updateShipmentStatus(req);

    res.status(StatusCodes.OK).json({
      data: result,
    })
  } catch (error) {
    next(error);
  }
}

module.exports = {
  index,
  create,
  find,
  update,
  destroy,
  readRevenue,
  readCountTransByStatus,
  readHighestSalesProduct,
  readLowestSalesProduct,
  readNewTransactions,
  readNewSchedules,
  updateShipment,
}
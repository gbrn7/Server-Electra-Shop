const { StatusCodes } = require('http-status-codes');
const { createTransaction, getAllTransaction, findTransaction, updateTransaction, deleteTransaction, getRevenueTrans, getCountTransByStatus, getHighestSalesProduct, getLowestSalesProduct, updateShipmentStatus, getlastSevenDaysTrans, getlastOneYearTrans, getSchedule, getTransactionReport } = require('../../../services/mongoose/transactions');

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
    console.log('error');
    const result = await createTransaction(req);

    res.status(StatusCodes.CREATED).json({
      data: result,
    });
  } catch (error) {
    console.log(error);
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
    const result = await getHighestSalesProduct();

    res.status(StatusCodes.OK).json({
      data: result,
    })
  } catch (error) {
    next(error);
  }
}

const readLowestSalesProduct = async (req, res, next) => {
  try {
    const result = await getLowestSalesProduct();

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

const lastSevenDaysTrans = async (req, res, next) => {
  try {
    const result = await getlastSevenDaysTrans();

    res.status(StatusCodes.OK).json({
      data: result,
    })
  } catch (error) {
    next(error);
  }
}

const lastOneYearTrans = async (req, res, next) => {
  try {
    const result = await getlastOneYearTrans();

    res.status(StatusCodes.OK).json({
      data: result,
    })
  } catch (error) {
    next(error);
  }
}

const getScheduleData = async (req, res, next) => {
  try {
    const result = await getSchedule(req);

    res.status(StatusCodes.OK).json({
      data: result,
    })
  } catch (error) {
    next(error);
  }
}

const getTransactionReportData = async (req, res, next) => {
  try {
    const result = await getTransactionReport(req);

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
  lastSevenDaysTrans,
  lastOneYearTrans,
  getScheduleData,
  getTransactionReportData,
}
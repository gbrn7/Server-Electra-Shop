const { StatusCodes } = require('http-status-codes');
const { createThumbnail } = require('../../../services/mongoose/thumbnail');

const index = async (req, res, next) => {
  try {
    const result = await getAllThumbnail(req);

    res.status(StatusCodes.OK).json({
      data: result,
    })
  } catch (error) {
    next(error);
  }
}

const create = async (req, res, next) => {
  try {
    const result = await createThumbnail(req);

    res.status(StatusCodes.CREATED).json({
      data: result,
    })
  } catch (error) {
    next(error);
  }
}

const find = async (req, res, next) => {
  try {
    const result = await findThumbnail(req);

    res.status(StatusCodes.OK).json({
      data: result,
    })
  } catch (error) {
    next(error);
  }
}

const update = async (req, res, next) => {
  try {
    const result = await updateThumbnail(req);

    res.status(StatusCodes.OK).json({
      data: result,
    })
  } catch (error) {
    next(error);
  }
}

const destroy = async (req, res, next) => {
  try {
    const result = await destroyThumbnail(req);

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
}
const { StatusCodes } = require('http-status-codes');
const { createThumbnail, checkingThumbnail, findThumbnailById, destroyThumbnailById } = require('../../../services/mongoose/thumbnail');

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

const checkthumb = async (req, res, next) => {
  try {
    const result = await checkingThumbnail(req.params.id);

    res.status(StatusCodes.OK).json({
      data: result,
    })
  } catch (error) {
    next(error);
  }
}

const destroy = async (req, res, next) => {
  try {
    const result = await destroyThumbnailById(req.params.id);

    res.status(StatusCodes.OK).json({
      data: result,
    })
  } catch (error) {
    next(error);
  }
}

module.exports = {
  create,
  destroy,
  checkthumb,
}
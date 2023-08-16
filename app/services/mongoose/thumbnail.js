const Thumbnail = require('../../api/v1/Thumbnail/model');
const { NotFoundError } = require('../../errors');
const deleteFiles = require('../../utils/deleteFiles');

const getAllThumbnail = async (req) => {
  const { limit, page } = req.query;

  const result = await Thumbnail.find();

  if (!result || result.length === 0) throw new NotFoundError('Product not Found');

  const countProducts = await Thumbnail.countDocuments();

  return { product: result, pages: Math.ceil(countProducts / limit), total: countProducts, page }
}

const createThumbnail = async (req) => {

  const { files } = req;

  files.map((item) => {
    item.path = `uploads/${item.filename}`
  });

  const result = await Thumbnail.create({ files });

  return result;
}

const checkingThumbnail = async (id) => {
  const result = await Thumbnail.findById(id);

  if (!result) throw new NotFoundError(`Thumbnail with id : ${id} not found`);

  return result;
}

const destroyThumbnailById = async (id) => {

  await checkingThumbnail(id);

  const result = await Thumbnail.findByIdAndDelete(id);

  deleteFiles(result.files);

  return result;
}

const updateThumbnail = async (req) => {

  const { id } = req.params;
  const { files } = req;

  const check = await checkingThumbnail(id);

  const result = await Thumbnail.findByIdAndUpdate(id, { files }, { new: true, runValidators: true });

  if (req.files) deleteFiles(check.files);

  return result;
}


module.exports = {
  getAllThumbnail,
  createThumbnail,
  checkingThumbnail,
  destroyThumbnailById,
  updateThumbnail,
}
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
    item.url = `uploads/${item.filename}`
  });

  const result = await Thumbnail.create({ files });

  return result;
}

const checkingThumbnail = async (id) => {
  const result = await Thumbnail.findById(id);

  console.log('check thumb')

  if (!result) throw new NotFoundError(`Thumbnail with id : ${id} not found`);

  console.log('check thumb2')

  return result;
}

const destroyThumbnailById = async (id) => {

  await checkingThumbnail(id);

  console.log('destroy block 46')

  const result = await Thumbnail.findByIdAndDelete(id);

  console.log('destroy block 50')

  deleteFiles(result.files);

  return result;
}

const updateThumbnail = async (req) => {

  const { id } = req.params;
  const { files } = req;

  files.map((item) => {
    item.url = `uploads/${item.filename}`
  });

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
const Thumbnail = require('../../api/v1/Thumbnail/model');
const { NotFoundError } = require('../../errors');
const deleteFiles = require('../../utils/deleteFiles');

const createThumbnail = async (req) => {

  const files = req.files;

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



module.exports = {
  createThumbnail,
  checkingThumbnail,
  destroyThumbnailById,
}
const Thumbnail = require('../../api/v1/Thumbnail/model');
const { NotFoundError } = require('../../errors');

const createThumbnail = async (req) => {

  const result = await Thumbnail.create({
    name: req.file ? `uploads/${req.file.filename}` : `uploads/defaultThumb/default.png`
  })

  return result;
}

const checkingThumbnail = async (id) => {
  const result = await Thumbnail.findById(id);

  if (!result) throw new NotFoundError('Thumbnail with id : ${id} not found');

  return result;
}


module.exports = {
  createThumbnail,
  checkingThumbnail,
}
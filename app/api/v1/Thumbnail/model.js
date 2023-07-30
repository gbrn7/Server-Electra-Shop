const mongoose = require('mongoose');
const { model, Schema } = mongoose;

const imagesSchema = Schema({
  fieldname: {
    type: String,
  },
  originalname: {
    type: String,
  },
  encoding: {
    type: String,
  },
  mimetype: {
    type: String,
  },
  destination: {
    type: String,
  },
  filename: {
    type: String,
    required: [true, 'the fileName is required'],
  },
  path: {
    type: String,
  },
  size: {
    type: Number,
  },
});

let thumbnailSchema = Schema(
  {
    files: {
      type: [imagesSchema]
    }
  },
  {
    timestamps: true
  }

);

module.exports = model('Thumbnail', thumbnailSchema);
const mongoose = require('mongoose');
const { model, Schema } = mongoose;

let thumbnailSchema = Schema(
  {
    name: {
      type: String
    }
  },
  {
    timestamps: true
  }

);

module.exports = model('Thumbnail', thumbnailSchema);
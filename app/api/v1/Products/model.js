const mongoose = require('mongoose');

const productsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'The name of product is required'],
  },
  price: {
    type: Number,
    required: [true, 'The price of product is required'],
  },
  desc: {
    type: text,
    required: [true, 'The description of product is required']
  },
  status: {
    type: String,
    enum: ['draft', 'publish'],
    default: 'publish'
  },
  weight: {
    type: Number,
    required: [true, 'The weight of product is required'],
  },
  thumbnail: {
    type: mongoose.Types.ObjectId,
    ref: 'Thumbnail',
    required: true,
  },
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', productsSchema);
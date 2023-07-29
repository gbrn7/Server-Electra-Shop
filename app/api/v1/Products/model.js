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
  stock: {
    type: Number,
    default: '0',
  },
  desc: {
    type: String,
    required: [true, 'The description of product is required']
  },
  status: {
    type: String,
    enum: ['draft', 'publish'],
    default: 'draft'
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
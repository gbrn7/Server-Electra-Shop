const mongoose = require('mongoose');
const { BadRequestError } = require('../../../errors');

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

productsSchema.pre('save', async function (next) {
  const product = this;
  if (product.isModified('stock')) {
    if (product.stock < 0) {
      throw new BadRequestError(`the product with id ${product.stock} is less than transaction req`);
    }
  }
});

module.exports = mongoose.model('Product', productsSchema);
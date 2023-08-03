const mongoose = require('mongoose');
const { model, Schema, Types } = mongoose;

const orderDetailSchema = new Schema({
  productId: {
    type: Types.ObjectId,
    required: true,
  },
  qty: {
    type: Number,
    required: true,
  }
});

const domainSchema = new Schema({
  city_id: {
    type: String,
    required: true,
  },
  province_id: {
    type: String,
    required: true,
  },
  province: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  city_name: {
    type: String,
    required: true,
  },
  postal_code: {
    type: String,
    required: true,
  },
});

const expeditionSchema = new Schema({
  origin_details: {
    type: domainSchema,
    required: true,
  },
  destination_details: {
    type: domainSchema,
    required: true,
  },
  courierDetail: {
    code: {
      type: String,
    },
    name: {
      type: String,
      required: true,
    },
    costs:
    {
      service: {
        type: String,
        required: true,
      },
      description: {
        type: String,
        required: true,
      },
      cost:
      {
        value: {
          type: Number,
          required: true,
        },
        etd: {
          type: String,
          required: true,
        },
        note: {
          type: String,
        }
      }
    },
  },
  shipment_status: {
    type: String,
    default: "pending",
  },
})

const transactionModel = new Schema({
  userId: {
    type: Types.ObjectId,
    ref: 'user',
    required: [true, 'The user id is required'],
  },
  address: {
    type: String,
    required: [true, 'the address for transaction is required'],
  },
  total: {
    type: Number,
    required: [true, 'total transactions is required'],
  },
  expedition: {
    type: expeditionSchema,
    required: [true, 'expedition data is required'],
  },
  transaction_code: {
    type: String,
    required: [true, 'transaction code is required'],
  },
  transaction_status: {
    type: String,
    default: "pending",
  },
  payment_link: {
    type: String,
  },
  payment_token: {
    type: String,
  },
  orderDetails: {
    type: [orderDetailSchema],
    required: [true, 'the order details id required '],
  },
},
  {
    timestamps: true
  }
);



module.exports = model('transaction', transactionModel);

const mongoose = require('mongoose');
const { model, Schema } = mongoose;
const bcrypt = require('bcrypt');

const userModel = Schema({
  name: {
    type: String,
    required: [true, "The name is required"],
    maxLength: [20, "The maximum name character is 20"],
    minLength: [3, "The minimum name character is 3"]
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'superAdmin'],
    default: 'user'
  },
  email: {
    type: String,
    unique: true,
    required: [true, "The email is already registered"]
  },
  password: {
    type: String,
    required: [true, "The password is required"],
    minLength: [5, "The minimum password character is 6 character"]
  },
  address: {
    type: String,
  },
  status: {
    type: String,
    enum: ['active', 'not active'],
    default: 'not active'
  },
  otp: {
    type: String,
    required: 'true'
  },
  phone_num: {
    type: String
  }
}, { timestamps: true },
);

userModel.pre('save', async function (next) {
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 12);
  }
});

userModel.methods.comparePassword = async function (candidatePasword) {
  const isMatch = await bcrypt.compare(candidatePasword, this.password);
  return isMatch;
};
module.exports = model('User', userModel);
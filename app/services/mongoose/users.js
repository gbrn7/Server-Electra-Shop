const Users = require('../../api/v1/users/model')

const createUsers = async (req) => {
  const {
    name,
    email,
    password,
    address,
    phone_num } = req.body;

  let result = await Users.findOne({
    email,
    status: 'not active',
  });

  const randomOtp = Math.floor(Math.random() * 9999);

  if (result) {
    result.name = name,
      result.role = 'user',
      result.email = email,
      result.address = address,
      result.password = password,
      result.otp = randomOtp;

    await result.save();
  } else {
    result = await Users.create({
      name,
      email,
      role: 'user',
      password,
      address,
      otp: randomOtp,
      phone_num
    })
  }

  delete result._doc.password;
  delete result._doc.otp;

  return result;
}

const activateUser = async (req) => {
  const { otp, email } = req.body;

  const check = await Users.findOne({ email });

  if (!check) return 'your email is not registered'

  if (!check && check.otp !== otp) return 'your otp code invalid'

  const result = await Users.findByIdAndUpdate(check._id, {
    status: 'active'
  }, { new: true, runValidators: true })

  //if new true, return the modified document rather than the original
  //if runValidators true, if true, return the modified document rather than the original

  delete result._doc.password;
  delete result._doc.otp;

  return result;
}

module.exports = {
  createUsers,
  activateUser,
}
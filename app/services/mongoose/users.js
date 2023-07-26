const Users = require('../../api/v1/users/model');
const { BadRequestError, UnauthorizedError, UnauthenticatedError } = require('../../errors');
const { createJWT, createTokenUser, createRefreshJWT } = require('../../utils');
const createRandomOtp = require('../../utils/createRandomOTP');
const { createUserRefreshToken } = require('./refreshToken');

const signUpUser = async (req) => {
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

  const randomOtp = createRandomOtp();

  if (result) {
    result.name = name;
    result.role = 'user';
    result.email = email;
    result.address = address;
    result.password = password;
    result.otp = randomOtp;
    result.phone_num = phone_num;

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

const signInUser = async (req) => {
  const { email, password } = req.body;

  if (!email || !password) throw new BadRequestError("Please Fill email and password field");
  //above code will pass badRequestError class that extend error class
  // the execution will passes control to catch block and will checked in function that receive err argument 

  const result = await Users.findOne({ email });

  if (!result) throw new UnauthorizedError("your email is'nt registered");

  if (result.status === 'not active') {
    throw new UnauthorizedError("your email is not yet active");
  }

  const isPasswordValid = await result.comparePassword(password);

  if (!isPasswordValid) throw new UnauthenticatedError("Invalid Credentials");

  delete result._doc.password;
  delete result._doc.otp;



  const token = createJWT({ payload: createTokenUser(result) });

  const refreshToken = createRefreshJWT(createTokenUser(result));
  // const token = createTokenUser(result);


  //create refresh token record to db
  await createUserRefreshToken({
    refreshToken,
    user: result._id,
  });

  return { token, refreshToken, role: result.role, email: result.email };

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

const createAdmin = async (req) => {
  const {
    name,
    email,
    password,
    address,
    phone_num,
    role
  } = req.body;

  let result = await Users.findOne({
    email,
    status: 'not active',
  });

  const randomOtp = createRandomOtp();

  if (result) {
    result.name = name;
    result.role = role;
    result.email = email;
    result.password = password;
    result.address = address;
    result.status = 'active';
    result.otp = randomOtp;
    result.phone_num = phone_num;

    await result.save();
  } else {
    result = await Users.create({
      name,
      role,
      email,
      password,
      address,
      status: 'active',
      otp: randomOtp,
      phone_num,
    })
  }

  delete result._doc.password;
  delete result._doc.otp;

  return result;

}


module.exports = {
  signUpUser,
  activateUser,
  signInUser,
  createAdmin,
}
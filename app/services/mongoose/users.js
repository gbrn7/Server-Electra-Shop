const Users = require('../../api/v1/users/model');
const { BadRequestError, UnauthorizedError, UnauthenticatedError, NotFoundError } = require('../../errors');
const { createJWT, createTokenUser, createRefreshJWT } = require('../../utils');
const createRandomOtp = require('../../utils/createRandomOTP');
const deleteSecretCredentials = require('../../utils/deleteSecretCredentials');
const { createUserRefreshToken } = require('./refreshToken');

//User Authorization
const signUpUser = async (req) => {
  const {
    name,
    email,
    password,
    address,
    phone_num } = req.body;

  let rawResult = await Users.findOne({
    email,
    status: 'not active',
  });

  const randomOtp = createRandomOtp();

  if (rawResult) {
    rawResult.name = name;
    rawResult.role = 'user';
    rawResult.email = email;
    rawResult.address = address;
    rawResult.password = password;
    rawResult.otp = randomOtp;
    rawResult.phone_num = phone_num;

    await rawResult.save();
  } else {
    rawResult = await Users.create({
      name,
      email,
      role: 'user',
      password,
      address,
      otp: randomOtp,
      phone_num
    })
  }

  const result = deleteSecretCredentials(rawResult);

  return result;
}

const signInUser = async (req) => {
  const { email, password } = req.body;

  if (!email || !password) throw new BadRequestError("Please Fill email and password field");
  //above code will pass badRequestError class that extend error class
  // the execution will passes control to catch block and will checked in function that receive err argument 

  const rawResult = await Users.findOne({ email });

  if (!rawResult) throw new UnauthorizedError("your email is'nt registered");

  if (rawResult.status === 'not active') {
    throw new UnauthorizedError("your email is not yet active");
  }

  const isPasswordValid = await rawResult.comparePassword(password);

  if (!isPasswordValid) throw new UnauthenticatedError("Invalid Credentials");

  const result = deleteSecretCredentials(rawResult);

  const token = createJWT({ payload: createTokenUser(result) });

  const refreshToken = createRefreshJWT(createTokenUser(result));

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

  const rawResult = await Users.findByIdAndUpdate(check._id, {
    status: 'active'
  }, { new: true, runValidators: true })

  //if new true, return the modified document rather than the original
  //if runValidators true, if true, return the modified document rather than the original

  const result = deleteSecretCredentials(rawResult);

  return result;
}

//admin Authorization
const createAdmin = async (req) => {
  const {
    name,
    email,
    password,
    address,
    phone_num,
    role
  } = req.body;

  let rawResult = await Users.findOne({
    email,
    status: 'not active',
  });

  const randomOtp = createRandomOtp();

  if (rawResult) {
    rawResult.name = name;
    rawResult.role = role;
    rawResult.email = email;
    rawResult.password = password;
    rawResult.address = address;
    rawResult.status = 'active';
    rawResult.otp = randomOtp;
    rawResult.phone_num = phone_num;

    await rawResult.save();
  } else {
    rawResult = await Users.create({
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

  const result = deleteSecretCredentials(rawResult);

  return result;

}

const signInAdmin = async (req) => {
  const { email, password } = req.body;

  if (!email || !password) throw new BadRequestError("Please Fill email and password field");
  //above code will pass badRequestError class that extend error class
  // the execution will passes control to catch block and will checked in function that receive err argument 

  const rawResult = await Users.findOne({
    email,
    $or: [
      { role: 'admin' },
      { role: 'superAdmin' }
    ]
  });

  if (!rawResult) throw new UnauthorizedError("your email is'nt registered");

  if (rawResult.status === 'not active') {
    throw new UnauthorizedError("your email is not yet active");
  }

  const isPasswordValid = await rawResult.comparePassword(password);

  const result = deleteSecretCredentials(rawResult);

  if (!isPasswordValid) throw new UnauthenticatedError("Invalid Credentials");

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

const updateDataUsers = async (req) => {
  const { id } = req.params;
  const {
    name,
    email,
    address,
    phone_num } = req.body;

  const checkId = await Users.findOne({
    _id: id,
  })

  if (!checkId) throw new NotFoundError(`the user with id ${id} not found`);

  let rawResult = await Users.findByIdAndUpdate(id, {
    name,
    email,
    address,
    phone_num,
  }, { new: true, runValidators: true });


  const result = deleteSecretCredentials(rawResult);

  return result;
}

const getAllUser = async (req) => {
  const { keyword, status, limit, page } = req.query;

  let condition = { role: 'user' };

  if (keyword) {
    condition = { ...condition, name: { $regex: keyword, $options: 'i' } }
  }
  if (status) {
    condition = { ...condition, status: { $regex: status, $options: 'i' } }
  }

  const rawResult = await Users.find(condition)
    .select({ password: 0, otp: 0 })
    .limit(limit)
    .skip(limit * (page - 1));

  if (!rawResult || rawResult.length === 0) throw new NotFoundError('User not Found');

  countUsers = await Users.countDocuments({ role: 'user' });

  return { users: rawResult, pages: Math.ceil(countUsers / limit), total: countUsers, page: page };
}

const getAllAdmin = async (req) => {
  const { keyword, status, limit, page } = req.query;

  let condition = {
    $or: [
      { role: 'admin' },
      { role: 'superAdmin' },
    ],
  };

  if (keyword) {
    condition = { ...condition, name: { $regex: keyword, $options: 'i' } }
  }
  if (status) {
    condition = { ...condition, status: { $regex: status, $options: 'i' } }
  }

  const result = await Users.find(condition)
    .select({ password: 0, otp: 0 })
    .limit(limit)
    .skip(limit * (page - 1));

  if (!result || result.length === 0) throw new NotFoundError('User not Found');

  countUsers = await Users.countDocuments({
    $or: [
      { role: 'admin' },
      { role: 'superAdmin' },
    ],
  });

  return { users: result, pages: Math.ceil(countUsers / limit), total: countUsers, page: page };
}

const getCountUsers = async (req) => {
  const { role } = req.query;

  let condition;
  if (role) {
    condition = { role: role }
  }

  const result = Users.countDocuments(condition);

  if (!result) throw new NotFoundError('Users not found');

  return result;
}

module.exports = {
  signUpUser,
  activateUser,
  signInUser,
  createAdmin,
  signInAdmin,
  updateDataUsers,
  getAllUser,
  getAllAdmin,
  getCountUsers,
}
const Users = require('../../api/v1/users/model');
const { BadRequestError, UnauthorizedError, UnauthenticatedError, NotFoundError } = require('../../errors');
const { createJWT, createTokenUser, createRefreshJWT } = require('../../utils');
const createRandomOtp = require('../../utils/createRandomOTP');
const deleteSecretCredentials = require('../../utils/deleteSecretCredentials');
const { otpMail } = require('../email');
const { createUserRefreshToken } = require('./refreshToken');

//User Authorization
const signUpUser = async (req) => {
  const {
    name,
    email,
    password,
    address,
    phone_num } = req.body;

  if (!email || !password || !name) throw new BadRequestError("Please Fill name, email, and password field");


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

  await otpMail(rawResult.email, rawResult);

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

const signInUserWithOauth = async (req) => {
  const googleId = req.user.id;

  const {
    name,
    email, } = req.user._json;

  if (!email || !name) throw new BadRequestError("email and name field is required");

  const result = await Users.findOne({ googleId });

  if (!result) {
    const randomOtp = createRandomOtp();

    const newUser = new Users;
    newUser.name = name;
    newUser.email = email;
    newUser.status = 'active';
    newUser.googleId = googleId;
    newUser.role = 'user';
    newUser.otp = randomOtp;

    await newUser.save({ validateBeforeSave: false });

    const token = createJWT({ payload: createTokenUser(newUser) });

    const refreshToken = createRefreshJWT(createTokenUser(newUser));

    //create refresh token record to db
    await createUserRefreshToken({
      refreshToken,
      user: newUser._id,
    });

    return { token, refreshToken, role: newUser.role, email: newUser.email };
  } else {

    const token = createJWT({ payload: createTokenUser(result) });

    const refreshToken = createRefreshJWT(createTokenUser(result));

    //create refresh token record to db
    await createUserRefreshToken({
      refreshToken,
      user: result._id,
    });

    return { token, refreshToken, role: result.role, email: result.email };
  }
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

const getDetailsUser = async (req) => {
  const { id } = req.params;

  const rawResult = await Users.findOne({ _id: id });


  if (!rawResult) throw new NotFoundError(`user with id ${id} not found`);

  const result = deleteSecretCredentials(rawResult);

  return result;
}

const updateDataUser = async (req) => {
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

//admin Authorization
const createAdmin = async (req) => {
  const {
    name,
    email,
    password,
    address,
    phone_num,
    status,
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
    rawResult.status = status;
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
      status,
      otp: randomOtp,
      phone_num,
    })
  }

  const result = deleteSecretCredentials(rawResult);

  return result;

}

const getDetailsAdmin = async (req) => {
  const { id } = req.params;

  const rawResult = await Users.findOne({
    _id: id, $or: [
      { role: 'admin' },
      { role: 'superAdmin' },
    ]
  });

  if (!rawResult) throw new NotFoundError(`admin with id ${id} not found`);

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

const updateDataAdmin = async (req) => {
  const { id } = req.params;

  const {
    name,
    email,
    address,
    phone_num,
    status,
    role
  } = req.body;

  const checkId = await Users.findOne({
    _id: id,
    $or: [
      { role: 'admin' },
      { role: 'superAdmin' }
    ],
  })

  if (!checkId) throw new NotFoundError(`the user with id ${id} not found`);

  if (req.user.role === 'admin' && req.user.userId !== id) throw new UnauthorizedError('Unauthorized to access this route');

  let rawResult = await Users.findByIdAndUpdate(id, {
    name,
    email,
    address,
    phone_num,
    status,
    role,
  }, { new: true, runValidators: true });


  const result = deleteSecretCredentials(rawResult);

  return result;
}

const deleteDataAdmin = async (req) => {
  const { id } = req.params;

  const result = await Users.findByIdAndDelete(id);

  if (!result) {
    throw new NotFoundError(`The admin with id ${id} not found`);
  }

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
    .skip(limit * (page - 1))
    .sort({ _id: -1 });

  if (!result || result.length === 0) throw new NotFoundError('User not Found');

  countUsers = await Users.countDocuments({
    $or: [
      { role: 'admin' },
      { role: 'superAdmin' },
    ],
  });

  return { admins: result, pages: Math.ceil(countUsers / limit), total: countUsers, page: page };
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

const editStatus = async (req) => {
  const { id } = req.params;
  const { status } = req.body

  const check = await Users.findById(id);

  if (!check) throw new NotFoundError(`The users with id ${id} not found`);

  if ((check.role === 'admin' || check.role === 'superAdmin') && req.user.role === 'admin') throw new UnauthorizedError(`Unauthorized to acces this route`);

  const rawResult = await Users.findByIdAndUpdate(check._id, {
    status: status
  }, { new: true, runValidators: true })

  const result = deleteSecretCredentials(rawResult);

  return result;
}

module.exports = {
  signUpUser,
  signInUser,
  signInUserWithOauth,
  activateUser,
  getDetailsUser,
  createAdmin,
  updateDataUser,
  signInAdmin,
  updateDataAdmin,
  getAllUser,
  getAllAdmin,
  getCountUsers,
  getDetailsAdmin,
  editStatus,
  deleteDataAdmin,
}
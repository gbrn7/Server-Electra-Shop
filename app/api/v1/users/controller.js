const { activateUser, signInUser, signUpUser, createAdmin, signInAdmin, updateDataUsers, getAllUser, getAllAdmin, getCountUsers, getDetailsUser } = require('../../../services/mongoose/users');
const { StatusCodes } = require('http-status-codes');


//User Authorization
const signUp = async (req, res, next) => {
  try {
    const result = await signUpUser(req);

    res.status(StatusCodes.CREATED).json({
      data: result,
    });

  } catch (error) {
    next(error);
  }
}

const signIn = async (req, res, next) => {
  try {
    const result = await signInUser(req);

    res.status(StatusCodes.OK).json({
      data: result,
    });

  } catch (error) {
    next(error);
  }
}

const updateUser = async (req, res, next) => {
  try {
    const result = await updateDataUsers(req);

    res.status(StatusCodes.OK).json({
      data: result,
    })
  } catch (error) {
    next(error);
  }
}

const activeUser = async (req, res, next) => {
  console.log('first')
  try {
    const result = await activateUser(req);

    res.status(StatusCodes.OK).json({
      data: result,
    });
  } catch (error) {
    next(error);
  }

}

const getDataUser = async (req, res, next) => {
  try {
    const result = await getDetailsUser(req);

    res.status(StatusCodes.OK).json({
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

//Admin Authorization
const getUsers = async (req, res, next) => {
  try {
    const result = await getAllUser(req);

    res.status(StatusCodes.OK).json({
      data: result,
    })
  } catch (error) {
    next(error);
  }
}

const createCmsAdmin = async (req, res, next) => {
  try {

    const result = await createAdmin(req);
    res.status(StatusCodes.CREATED).json({
      data: result,
    });

  } catch (error) {
    next(error);
  }
}

const signInCmsAdmin = async (req, res, next) => {
  try {
    const result = await signInAdmin(req);

    res.status(StatusCodes.OK).json({
      data: result,
    });

  } catch (error) {
    next(error);
  }
}

const getAdmins = async (req, res, next) => {
  try {
    const result = await getAllAdmin(req);

    res.status(StatusCodes.OK).json({
      data: result,
    })

  } catch (error) {
    next(error);
  }
}

const countUsers = async (req, res, next) => {
  try {
    const result = await getCountUsers(req);

    res.status(StatusCodes.OK).json({
      data: result,
    })

  } catch (error) {
    next(error);
  }
}

module.exports = {
  signUp,
  signIn,
  activeUser,
  createCmsAdmin,
  signInCmsAdmin,
  updateUser,
  getUsers,
  getAdmins,
  countUsers,
  getDataUser,
}
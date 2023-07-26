const { activateUser, signInUser, signUpUser, createAdmin } = require('../../../services/mongoose/users');
const { StatusCodes } = require('http-status-codes');

//create function
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
module.exports = {
  signUp,
  signIn,
  activeUser,
  createCmsAdmin,
}
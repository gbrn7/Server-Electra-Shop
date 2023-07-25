const { createUsers, activateUser } = require('../../../services/mongoose/users');
const { StatusCodes } = require('http-status-codes');

//create function
const create = async (req, res, next) => {
  try {

    const result = await createUsers(req);

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
  create,
  activeUser
}
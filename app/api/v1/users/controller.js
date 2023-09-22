const { activateUser, signInUser, signUpUser, createAdmin, signInAdmin, updateDataUser, getAllUser, getAllAdmin, getCountUsers, getDetailsUser, getDetailsAdmin, updateDataAdmin, editStatus, signInUserWithOauth, deleteDataAdmin } = require('../../../services/mongoose/users');
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
    const result = await updateDataUser(req);

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

const getDataAdmin = async (req, res, next) => {
  try {
    const result = await getDetailsAdmin(req);

    res.status(StatusCodes.OK).json({
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

const updateAdmin = async (req, res, next) => {
  try {
    const result = await updateDataAdmin(req);

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

const editStatusUser = async (req, res, next) => {
  try {
    const result = await editStatus(req);

    res.status(StatusCodes.OK).json({
      data: result,
    })
  } catch (error) {
    next(error);
  }
}

const destroy = async (req, res, next) => {
  try {
    const result = await deleteDataAdmin(req);

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
  updateUser,
  activeUser,
  getDataUser,
  getUsers,
  getDataAdmin,
  updateAdmin,
  updateAdmin,
  createCmsAdmin,
  signInCmsAdmin,
  getAdmins,
  countUsers,
  editStatusUser,
  destroy,
}
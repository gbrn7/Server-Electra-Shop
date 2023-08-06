const { StatusCodes } = require("http-status-codes");
const { signInUserWithOauth } = require("../../../services/mongoose/users");

const oauthHandler = async (req, res, next) => {
  try {
    const result = await signInUserWithOauth(req);

    res.status(StatusCodes.OK).json({
      data: result,
    });

  } catch (error) {
    next(error);
  }
}

module.exports = oauthHandler;
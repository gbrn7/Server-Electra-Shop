const UserRefreshToken = require('../../api/v1/userRefreshToken/model');
const {
  isTokenRefreshValid,
  createJWT,
  createTokenUser,
} = require('../../utils');
const Users = require('../../api/v1/users/model');
const { NotFoundError, BadRequestError } = require('../../errors');

const createUserRefreshToken = async (payload) => {
  const result = await UserRefreshToken.create(payload);

  return result;
};

const getUserRefreshToken = async (req) => {
  const { refreshToken, email } = req.params;
  const result = await UserRefreshToken.findOne({
    refreshToken,
  });

  if (!result) throw new NotFoundError(`refreshToken tidak valid `);

  const payload = isTokenRefreshValid({ token: result.refreshToken });

  if (email !== payload.email) {
    throw new BadRequestError(`email tidak valid`);
  }

  const userCheck = await Users.findOne({ email: payload.email });

  const token = createJWT({ payload: createTokenUser(userCheck) });

  //we can set every refresh token used we generate the new refresh toke again 
  // const newrefreshToken = createRefreshJWT({ payload: createTokenUser(result) });

  // await createUserRefreshToken({
  //   refreshToken,
  //   user: result._id,
  // });

  // return {
  //   token,
  //   refreshToken: newrefreshToken
  // };

  return token
};


module.exports = { createUserRefreshToken, getUserRefreshToken };
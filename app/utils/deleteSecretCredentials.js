const deleteSecretCredentials = (req) => {
  delete req._doc.password;
  delete req._doc.otp;

  return req;
}

module.exports = deleteSecretCredentials;
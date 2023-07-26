const createRandomOtp = () => {
  return Math.floor(Math.random() * 9999);
}

module.exports = createRandomOtp;
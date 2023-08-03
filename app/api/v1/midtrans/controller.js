const { handlerApi } = require('../../../services/midtrans')

const handlerWebhook = async (req) => {
  try {
    await handlerApi(req);
  } catch (error) {
    console.log(error);
  }
}

module.exports = handlerWebhook;
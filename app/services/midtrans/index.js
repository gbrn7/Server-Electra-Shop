const midrans = require('midtrans-client');
const { Snap } = midrans;
const { MidtransIsProduction, MidtransServerKey, MidtransClientKey } = require('../../config');
const Transactions = require('../../api/v1/Transactions/model');

const makeMidtrans = async (transaction, req) => {
  const { name, email } = req.user;

  // Create Snap API instance
  const snap = new Snap({
    // Set to true if you want Production Environment (accept real transaction).
    isProduction: JSON.parse(MidtransIsProduction),
    serverKey: MidtransServerKey,
  });

  const parameter = {
    "transaction_details": {
      "order_id": transaction._id.valueOf(),
      "gross_amount": transaction.total
    },
    "credit_card": {
      "secure": true
    },
    "customer_details": {
      "first_name": name,
      "email": email,
    }
  };


  const midtransResult = await snap.createTransaction(parameter);

  return midtransResult;
}

const handlerApi = async (req) => {
  let apiClient = new Snap({
    isProduction: JSON.parse(MidtransIsProduction),
    serverKey: MidtransServerKey,
    clientKey: MidtransClientKey
  });

  apiClient.transaction.notification(req.body)
    .then(async (statusResponse) => {
      const orderId = statusResponse.order_id;
      const transactionStatus = statusResponse.transaction_status;
      const fraudStatus = statusResponse.fraud_status;

      let statusResult;

      if (transactionStatus == 'capture') {
        if (fraudStatus == 'accept') {
          // TODO set transaction status on your database to 'success'
          // and response with 200 OK
          statusResult = 'success';
        }
      } else if (transactionStatus == 'settlement') {
        // TODO set transaction status on your database to 'success'
        // and response with 200 OK
        statusResult = 'success'
      } else if (transactionStatus == 'cancel' ||
        transactionStatus == 'deny' ||
        transactionStatus == 'expire') {
        // TODO set transaction status on your database to 'failure'
        // and response with 200 OK
        statusResult = 'failure'
      } else if (transactionStatus == 'pending') {
        // TODO set transaction status on your database to 'pending' / waiting payment
        // and response with 200 OK
        statusResult = 'pending'
      }
      //update transactions status
      await Transactions.findByIdAndUpdate(orderId, {
        transaction_status: statusResult,
      });
    });

}

module.exports = {
  makeMidtrans,
  handlerApi
};
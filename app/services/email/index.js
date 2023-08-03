const nodemailer = require('nodemailer');
const { gmail, pass } = require('../../config');
const Mustache = require('mustache');
const fs = require('fs');

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: gmail,
    pass: pass
  }
});

const otpMail = async (emailDestination, data) => {
  try {
    let template = fs.readFileSync('app/views/email/otp.html', 'utf-8');

    let message = {
      from: gmail,
      to: emailDestination,
      subject: 'Otp Mail',
      html: Mustache.render(template, data),
    }

    return await transporter.sendMail(message);
  } catch (error) {
    console.log(error)
  }
}

const transactionInvoice = async (emailDestination, data) => {
  try {
    let template = fs.readFileSync('app/views/email/invoice.html', 'utf-8');

    let message = {
      from: gmail,
      to: emailDestination,
      subject: 'Electra Invoice',
      html: Mustache.render(template, data),
    }

    return await transporter.sendMail(message);
  } catch (error) {
    console.log(error)
  }
}

module.exports = {
  otpMail,
  transactionInvoice,
}
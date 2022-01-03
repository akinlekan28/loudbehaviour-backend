const nodemailer = require("nodemailer");
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_KEY);

const sendEmail = async (options) => {
  const msg = {
    to: options.email, // Change to your recipient
    from: "akinlekan@gmail.com", // Change to your verified sender
    subject: options.subject,
    html: options.html,
  };

  const info = await sgMail.send(msg);
  return info;
};

module.exports = sendEmail;

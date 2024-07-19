const nodemailer = require("nodemailer");

const getUserMessage = async (msgObj) => {
  const { username, email, phone, userMessage } = msgObj;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.USER,
      pass: process.env.PASSWORD,
    },
  });

  const htmlContent = `<div style="font-family: Arial, sans-serif; padding: 20px; border-radius: 10px; background-color: #f5f5f5;">
  <p style="font-size: 18px; color: #333; margin-bottom: 10px;">Message: ${userMessage}</p>
  <p style="font-size: 14px; color: #555;">Name: ${username}</p>
  <p style="font-size: 14px; color: #555;">Email: <link>${email}</link></p>
  <p style="font-size: 14px; color: #555;">Contact Number: ${phone}</p>
  </div>`;

  const mailOptions = {
    from: email,
    to: process.env.USER,
    subject: `${username} sent you a message`,
    html: htmlContent,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Email has been sent from user", username);
  } catch (err) {
    console.log(err);
  }
};

module.exports = getUserMessage;

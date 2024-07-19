const nodemailer = require("nodemailer");
const cron = require("node-cron");
const axios = require("axios");
const User = require("../db/user.model");

const sendMail = async (user) => {
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

  const quoteResponse = await axios.get(
    "https://api.quotable.io/quotes/random",
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  const quote = quoteResponse.data[0].content;
  const author = quoteResponse.data[0].author;
  console.log(quote);

  const htmlContent = `<div style="font-family: Arial, sans-serif; padding: 20px; border-radius: 10px; background-color: #f5f5f5;">
  <p style="font-size: 18px; color: #333; margin-bottom: 10px;">"${quote}"</p>
  <p style="font-size: 14px; color: #555;">~ ${author}</p>
  </div>`;

  const mailOptions = {
    from: {
      name: "Ayarn Modi",
      address: process.env.USER,
    },
    to: user.email,
    subject: "Quote of the day",
    html: htmlContent,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Email has been sent from job file to", user.email);
  } catch (err) {
    console.log(err);
  }
};

const startCronJobForUser = async (user) => {
  const [hour, minute] = user.emailReceivingTime.split(":");

  cron.schedule(`${minute} ${hour} * * *`, () => {
    sendMail(user);
  });
};

const startCronJobsForAllUsers = async () => {
  const users = await User.find({ subscribed: true });
  
  users.forEach((user) => {
    startCronJobForUser(user);
  });
};

module.exports = startCronJobsForAllUsers;

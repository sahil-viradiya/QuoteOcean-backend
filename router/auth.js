const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../db/user.model");
const authenticate = require("../middleware/authenticate");
const getUserMessage = require("./getUserMessage");

const router = express.Router();

const startCronJobsForAllUsers = require("../jobs/sendEmail");

startCronJobsForAllUsers();

// Home route
router.get("/", (req, res) => {
  res.send(`Home route from server`);
});

// Subscribe route
router.post("/subscribe", authenticate, async (req, res) => {
  const { emailReceivingTime, email, subscribed } = req.body;

  if (!emailReceivingTime) {
    return res.status(400).json({ error: "Please fill require data" });
  }

  const user = await User.findOne({ email: email });

  if (user) {
    user.emailReceivingTime = emailReceivingTime;
    user.subscribed = subscribed;
    await user.save();
    res.status(201).json({ message: "Successfully Subscribed !" });
  }
});

// Register route
router.post("/register", async (req, res) => {
  const { username, email, password, phone } = req.body;

  if (!username || !email || !password || !phone) {
    return res.status(422).json({ error: "Please fill require data" });
  }

  try {
    const userExist = await User.findOne({ email: email });

    if (userExist) {
      return res.status(422).json({ error: "Email already exist" });
    }

    const user = new User({ username, email, password, phone });
    await user.save();

    res.status(201).json({ message: "User successfully registered" });
  } catch (err) {
    console.log(err);
  }
});

// Login route
router.post("/login", async (req, res) => {
  try {
    let token;
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Please fill require data" });
    }

    const userLogin = await User.findOne({ email: email });

    if (userLogin) {
      const isPasswordMatch = await bcrypt.compare(
        password,
        userLogin.password
      );

      token = await userLogin.generateAuthToken();

      res.cookie("jwtoken", token, {
        expires: new Date(Date.now() + 3000000),
        httpOnly: true,
        secure: true,
        sameSite: "none"
      });

      if (!isPasswordMatch) {
        res.status(400).json({ error: "Invalid Credentials" });
      } else {
        res.json({ message: "User login successful", token: token });
      }
    } else {
      res.status(400).json({ error: "Invalid Credentials" });
    }
  } catch (err) {
    console.log(err);
  }
});

// About route
router.get("/about", authenticate, (req, res) => {
  res.send(req.rootUser);
});

// Contact route
router.post("/contact", async (req, res) => {
  const msgObj = req.body;

  try {
    await getUserMessage(msgObj);
    res
      .status(201)
      .json({ message: "Your message successfully send to Admin !" });
  } catch (err) {
    console.log(err);
  }
});

// Logout route
router.get("/logout", (req, res) => {
  res.clearCookie("jwtoken", { path: "/" });
  res.status(200).send("User Logout");
});

// common route for getting user data
router.get("/getdata", authenticate, (req, res) => {
  res.send(req.rootUser);
});

module.exports = router;

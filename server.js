const express = require("express");
const app = express();

const dotenv = require("dotenv");
dotenv.config();

const PORT = process.env.PORT;

const cookieParser = require("cookie-parser");

// cors
const cors = require("cors");

const allowedOrigins = [
  "https://quote-ocean-frontend.vercel.app",
  /^https:\/\/quote-ocean-frontend-\w+-ayarn-modis-projects\.vercel\.app$/,
];

// Use dynamic origin based on the request
app.use(
  cors({
    origin: (origin, callback) => {
      // Check if the origin is allowed
      const isAllowed = allowedOrigins.some((allowedOrigin) => {
        if (typeof allowedOrigin === "string") {
          return allowedOrigin === origin;
        } else if (allowedOrigin instanceof RegExp) {
          return allowedOrigin.test(origin);
        }
        return false;
      });

      callback(null, isAllowed ? origin : false);
    },
    credentials: true,
  })
);

// connection to database
const connectDB = require("./db/dbConnection");
connectDB();

// middleware for json data + cookie parser
app.use(express.json());
app.use(cookieParser());

// contains all routes
app.use(require("./router/auth"));

// server running on this PORT
app.listen(PORT, () => {
  console.log(`Running on Port ${PORT}`);
});

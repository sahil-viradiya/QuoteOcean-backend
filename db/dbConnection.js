const mongoose = require('mongoose');

const url = process.env.DB_CONNECT_URL;

// connecting to database
const connectDB = async () => {
    try {
        await mongoose.connect(url);
        console.log('DB connected');
    } catch (err) {
        console.log(`Unable to connect ${err}`)
    }
}

module.exports = connectDB;

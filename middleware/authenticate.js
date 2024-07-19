const jwt = require('jsonwebtoken');
const User = require('../db/user.model');

// Middleware for token verification
const Authenticate = async (req, res, next) => {
    try {
        const token = req.cookies.jwtoken;
        const verifyToken = jwt.verify(token, "THETOKENKEYFORJWTOKENISHEREWITH31102001STRONGKEY");

        const rootUser = await User.findOne({ _id: verifyToken._id, token: token });

        if (!rootUser) {
            throw new Error('User not found');
        }

        req.token = token;
        req.rootUser = rootUser;
        req.userID = rootUser._id;

        next();
    } catch (err) {
        res.status(401).json('Unauthorized: No token found');
        console.log(err);
    }
};

module.exports = Authenticate;

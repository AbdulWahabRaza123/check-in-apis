const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization'];

    if(!token)
    {
        return res.status(401).json({status: false, message: "No token Provided"});
    }

    jwt.verify(token, process.env.MYSECRET, (err, decoded) => {
        if (err) {
            return res.status(500).json({ status: false, message: 'Failed to authenticate token' });
        }
        
        next();
    })
};

module.exports = {authenticateToken};

const { USER } = require('../models/user')
const authenticate = (req, res, next) => {
    const token = req.header('x-auth');
    USER.findByToken(token).then((user) => {
        if (!user) {
            return Promise.reject();
        }
        req.user = user;
        req.token = token;
        next(); // we need to call next, when we want to pass the request from middleware to original route, otherwise it will not go to anywhere
    }).catch((error)=> {
        res.status(401).send()
    })
}

module.exports = { authenticate }

const _ = require('lodash');
let cors = require('cors'); // for CORS compatibility
const Mongoose = require('mongoose');
Mongoose.set('useFindAndModify', false); // setting to close down the deprecation warning for findByIdAndUpdate command.
const { ObjectId } = require('mongodb');
const express = require('express');
const bodyParser = require('body-parser');

// setting config for this app
require('./config');
const { USER } = require('./models/user');
const { SCORE } = require('./models/score');
//importing middleware
const { authenticate } = require('./middleware/authenticate');

// getting PORT number from environment for Heroku deployment.
const port = process.env.PORT || 3000

const dbURI = process.env.MongoDB_URI;
// nothing just for testing
Mongoose.connect(dbURI, { useNewUrlParser: true }).then((success) => {
    console.log('Mongodb connected with ' + dbURI);
}).catch((error) => {
    console.error('Unsuccessful db connection', error);
});

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post('/user/new', (req, res) => {
    // it just creates a new object with given keys
    const newUser =new USER(_.pick(req.body, ['username', 'password']));
    newUser.save().then((doc) => {
        newUser.generateAuthToken().then((token) => {
            res.header('x-auth', token).send({...newUser, 'x-auth': token});
        })
    }, (err) => {
        res.status(400).send(err.message);
    })
})

app.get('/user/me', authenticate, (req, res) => {
    res.send(req.user);
})

// route to login a user
app.post('/user/login', (req, res) => {
    const userCred = _.pick(req.body, ['username', 'password'])
    USER.findByCredentials(userCred.username, userCred.password).then((user) => {
        user.generateAuthToken().then((token) => {
            res.header('x-auth', token).send({...user, 'x-auth': token});
        })
    }).catch((error) => {
        res.status(400).send(error);
    })
})

// route to logout the user by deleting the token from db
app.delete('/user/delete/token', authenticate, (req, res) => {
    req.user.removeToken(req.token).then((res) => {
        res.status(200).send();
    }).catch(() => {
        res.status(200).send();
    })
})

app.post('/user/game/score', authenticate, (req, res) => {
    const newScore = new SCORE({
        score: req.body.score,
        _userId: req.user._id
    })
    newScore.save().then((response) => {
        res.send();
    }).catch((error) => {
        res.status(403).send(error);
    })
})

app.listen(port, () => {
    console.log(`NodeJS server started with expressJS on the port ${port}`);
})

module.exports = {
    app
}
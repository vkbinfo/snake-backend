// setting config for this app
require('../config');
const _ = require('lodash');
const Mongoose = require('mongoose');
Mongoose.set('useFindAndModify', false); // setting to close down the deprecation warning for findByIdAndUpdate command.
const { ObjectId } = require('mongodb');
const express = require('express');
const bodyParser = require('body-parser');

const { USER } = require('../models/user');

// getting PORT number from environment for Heroku deployment.
const port = process.env.PORT || 3000

const dbURI = process.env.MongoDB_URI;

Mongoose.connect(dbURI, { useNewUrlParser: true }).then((success) => {
    console.log('Mongodb connected with ' + dbURI);
}).catch((error) => {
    console.error('Unsuccessful db connection', error);
});

const app = express();
app.use(bodyParser.json());

app.post('/user/new', (req, res) => {
    // it just creates a new object with given keys
    const newUser =new USER(_.pick(req.body, ['email', 'password']));
    newUser.save().then((doc) => {
        newUser.generateAuthToken().then((token) => {
            res.header('x-auth', token).send(newUser);
        })
    }, (err) => {
        console.error('Validation Error', err);
        res.status(400).send(err.message);
    })
})

app.listen(port, () => {
    console.log(`NodeJS server started with expressJS on the port ${port}`);
})

module.exports = {
    app
}
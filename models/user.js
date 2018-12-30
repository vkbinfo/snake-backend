const Mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const APP_SECRET = 'authsecretthatrequiresforJWTTokens';

const userSchema = Mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        minlength: 3
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    tokens: [{
        access: {
            type: String,
            required: true
        },
        token: {
            type: String,
            required: true
        }
    }]
})

// When mongoose save the user, we can override what it returns in this specific method
userSchema.methods.toJSON = function() {
    const user = this;
    return { _id: user._id, username: user.username }
}

// the methods array is applied on individual document
userSchema.methods.generateAuthToken = function () { // we are not using arrow function, because mongoose adds this as user object 
    const user = this; // so we can use the user object inside this function
    const access = 'auth';
    const token = jwt.sign({
        _id: user._id,
        access
    }, APP_SECRET)
    user.tokens.push({
        access,
        token
    })
    return user.save().then(() => {
        return token;
    });
}

// method to remove the token from user document to logout from the server
userSchema.methods.removeToken = function (token) {
    const user = this;
    return user.update({
        $pull: { // mongodb operator, will pull the specific element from array and delete it.
            tokens: {
                token: token
            }
        }
    })
}

// this statics array holds the static class function like function and this function's this will be bind to the Model USER.
userSchema.statics.findByToken = function (token) {
    const USER = this;
    let decoded;
    try {
        decoded = jwt.verify(token, APP_SECRET);
    } catch(e) {
        return Promise.reject();
    }
    return USER.findOne({
        _id: decoded._id,
        'tokens.access': decoded.access,
        'tokens.token': token
    })
}

userSchema.statics.findByCredentials = function (email, password) {
    const USER = this;
    return USER.findOne({
        email: email
    }).then((user) => {
        if (!user) {
            return Promise.reject('User does not Exist');
        }
        return new Promise((resolve, reject) => {
            bcrypt.compare(password, user.password, (err, res) => {
                if (err) {
                    return reject('Something went wrong');
                }
                if (!res) {
                    return reject('Wrong Password');
                }
                resolve(user);
            })
        })
    })

}

// Adding a middleware or a hook before calling the save function on the document
userSchema.pre('save', function (next) {
    const user = this;
    if (user.isModified('password')) { // isModified checks if the given parameter field is modified or not
        bcrypt.genSalt(10, (error, salt) => { // if you want to make this process long, so login attempts can be reduced, just increase the salt round parameter, here that parameter is 10
            bcrypt.hash(user.password, salt, (error, hash) => {
                user.password = hash;
                next();
            })
        })
    } else {
        next()
    }
})
const USER = Mongoose.model('User', userSchema);



module.exports = {
    USER
}

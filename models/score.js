const Mongoose = require('mongoose');

const scoreSchema = Mongoose.Schema({ 
    score: {
        type: Number,
        required: true,
    },
    _username: {
        type: String,
        required: true
    }
})

const SCORE = Mongoose.model('Score', scoreSchema);



module.exports = {
    SCORE
}
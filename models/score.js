const Mongoose = require('mongoose');

const scoreSchema = Mongoose.Schema({ 
    score: {
        type: Number,
        required: true,
    },
    _userId: {
        type: Mongoose.Schema.Types.ObjectId,
        required: true
    }
})

const SCORE = Mongoose.model('Score', scoreSchema);



module.exports = {
    SCORE
}
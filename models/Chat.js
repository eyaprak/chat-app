const mongoose = require('mongoose')

const ChatSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    sentTime: {
        type: Date,
        required: true
    }
})

module.exports = mongoose.model('Chat', ChatSchema);
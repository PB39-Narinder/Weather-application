const mongoose = require('mongoose');

const weatherSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    city: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    temp: Number,
    feels_like: Number,
    humidity: Number,
    wind_speed: Number,
    description: String,
    icon: String,
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Weather', weatherSchema); 
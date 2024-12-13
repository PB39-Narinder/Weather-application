const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
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
    weather: {
        temp: Number,
        feels_like: Number,
        humidity: Number,
        wind_speed: Number,
        description: String,
        icon: String
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
});

// Compound index to ensure a user can't favorite the same city multiple times
favoriteSchema.index({ user: 1, city: 1 }, { unique: true });

// Method to update weather data
favoriteSchema.methods.updateWeather = function(weatherData) {
    this.weather = {
        temp: weatherData.temp,
        feels_like: weatherData.feels_like,
        humidity: weatherData.humidity,
        wind_speed: weatherData.wind_speed,
        description: weatherData.description,
        icon: weatherData.icon
    };
    this.lastUpdated = Date.now();
};

module.exports = mongoose.model('Favorite', favoriteSchema); 
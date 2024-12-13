const express = require('express');
const router = express.Router();
const axios = require('axios');
const Favorite = require('../models/Favorite');
const auth = require('../middleware/auth');

// Get all favorites
router.get('/', auth, async (req, res) => {
    try {
        const favorites = await Favorite.find({ user: req.session.user.id });
        
        // Update weather data for each favorite
        await Promise.all(favorites.map(async (favorite) => {
            try {
                const response = await axios.get(
                    `https://api.openweathermap.org/data/2.5/weather?q=${favorite.city}&units=metric&appid=${process.env.OPENWEATHER_API_KEY}`
                );

                const weatherData = {
                    temp: response.data.main.temp,
                    feels_like: response.data.main.feels_like,
                    humidity: response.data.main.humidity,
                    wind_speed: response.data.wind.speed,
                    description: response.data.weather[0].description,
                    icon: response.data.weather[0].icon
                };

                favorite.updateWeather(weatherData);
                await favorite.save();
            } catch (error) {
                console.error(`Failed to update weather for ${favorite.city}:`, error);
            }
        }));

        res.render('favorites', { favorites });
    } catch (error) {
        res.render('favorites', { 
            favorites: [],
            error: 'Failed to fetch favorites'
        });
    }
});

// Add to favorites
router.post('/', auth, async (req, res) => {
    try {
        const { city } = req.body;
        const response = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${process.env.OPENWEATHER_API_KEY}`
        );

        const favorite = new Favorite({
            user: req.session.user.id,
            city: response.data.name,
            country: response.data.sys.country
        });

        const weatherData = {
            temp: response.data.main.temp,
            feels_like: response.data.main.feels_like,
            humidity: response.data.main.humidity,
            wind_speed: response.data.wind.speed,
            description: response.data.weather[0].description,
            icon: response.data.weather[0].icon
        };

        favorite.updateWeather(weatherData);
        await favorite.save();

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Failed to add favorite'
        });
    }
});

// Remove from favorites
router.delete('/:id', auth, async (req, res) => {
    try {
        await Favorite.findOneAndDelete({
            _id: req.params.id,
            user: req.session.user.id
        });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Failed to remove favorite'
        });
    }
});

module.exports = router; 
const express = require('express');
const router = express.Router();
const axios = require('axios');
const Weather = require('../models/Weather');
const auth = require('../middleware/auth');

// Get weather page
router.get('/', auth, async (req, res) => {
    try {
        const { city } = req.query; // Get city from query params

        if (city) {
            // Fetch current weather
            const currentWeather = await axios.get(
                `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${process.env.OPENWEATHER_API_KEY}`
            );

            // Fetch 24-hour forecast
            const forecast = await axios.get(
                `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${process.env.OPENWEATHER_API_KEY}&cnt=24`
            );

            const weather = {
                city: currentWeather.data.name,
                country: currentWeather.data.sys.country,
                temp: currentWeather.data.main.temp,
                feels_like: currentWeather.data.main.feels_like,
                humidity: currentWeather.data.main.humidity,
                wind_speed: currentWeather.data.wind.speed,
                description: currentWeather.data.weather[0].description,
                icon: currentWeather.data.weather[0].icon,
                user: req.session.user.id
            };

            // Save weather data
            await Weather.create(weather);

            // Process forecast data
            const forecastData = forecast.data.list.map(item => ({
                dt: item.dt,
                temp: item.main.temp,
                feels_like: item.main.feels_like,
                humidity: item.main.humidity,
                wind_speed: item.wind.speed,
                description: item.weather[0].description,
                icon: item.weather[0].icon
            }));

            return res.render('weather', { 
                weather,
                forecast: forecastData,
                error: null
            });
        }

        // If no city provided, show empty weather page
        res.render('weather', { 
            weather: null,
            forecast: null,
            error: null
        });
    } catch (error) {
        console.error('Weather fetch error:', error);
        let errorMessage = 'Failed to fetch weather data';

        if (error.response) {
            switch (error.response.status) {
                case 404:
                    errorMessage = 'City not found. Please check the spelling and try again.';
                    break;
                case 401:
                    errorMessage = 'API key error. Please contact support.';
                    break;
                case 429:
                    errorMessage = 'Too many requests. Please try again later.';
                    break;
            }
        }

        res.render('weather', { 
            weather: null,
            forecast: null,
            error: errorMessage
        });
    }
});

// Get weather by coordinates
router.post('/location', auth, async (req, res) => {
    try {
        const { lat, lon } = req.body;
        
        if (!lat || !lon) {
            return res.render('weather', {
                weather: null,
                forecast: null,
                error: 'Location coordinates are required'
            });
        }
        
        // Fetch current weather
        const currentWeather = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${process.env.OPENWEATHER_API_KEY}`
        );

        // Fetch 24-hour forecast
        const forecast = await axios.get(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${process.env.OPENWEATHER_API_KEY}&cnt=24`
        );

        const weather = {
            city: currentWeather.data.name,
            country: currentWeather.data.sys.country,
            temp: currentWeather.data.main.temp,
            feels_like: currentWeather.data.main.feels_like,
            humidity: currentWeather.data.main.humidity,
            wind_speed: currentWeather.data.wind.speed,
            description: currentWeather.data.weather[0].description,
            icon: currentWeather.data.weather[0].icon,
            user: req.session.user.id
        };

        // Save weather data
        await Weather.create(weather);

        // Process forecast data
        const forecastData = forecast.data.list.map(item => ({
            dt: item.dt,
            temp: item.main.temp,
            feels_like: item.main.feels_like,
            humidity: item.main.humidity,
            wind_speed: item.wind.speed,
            description: item.weather[0].description,
            icon: item.weather[0].icon
        }));

        // Send HTML response instead of JSON
        res.render('weather', { 
            weather,
            forecast: forecastData,
            error: null
        });
    } catch (error) {
        console.error('Weather fetch error:', error);
        let errorMessage = 'Failed to fetch weather data';

        if (error.response) {
            switch (error.response.status) {
                case 400:
                    errorMessage = 'Invalid coordinates. Please try again.';
                    break;
                case 401:
                    errorMessage = 'API key error. Please contact support.';
                    break;
                case 429:
                    errorMessage = 'Too many requests. Please try again later.';
                    break;
            }
        }

        res.render('weather', { 
            weather: null,
            forecast: null,
            error: errorMessage
        });
    }
});

// Get weather by city
router.post('/', auth, async (req, res) => {
    try {
        const { city } = req.body;
        
        if (!city || city.trim().length === 0) {
            return res.render('weather', {
                weather: null,
                forecast: null,
                error: 'Please enter a valid city name'
            });
        }
        
        // Fetch current weather
        const currentWeather = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city.trim())}&units=metric&appid=${process.env.OPENWEATHER_API_KEY}`
        );

        // Fetch 24-hour forecast
        const forecast = await axios.get(
            `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city.trim())}&units=metric&appid=${process.env.OPENWEATHER_API_KEY}&cnt=24`
        );

        const weather = {
            city: currentWeather.data.name,
            country: currentWeather.data.sys.country,
            temp: currentWeather.data.main.temp,
            feels_like: currentWeather.data.main.feels_like,
            humidity: currentWeather.data.main.humidity,
            wind_speed: currentWeather.data.wind.speed,
            description: currentWeather.data.weather[0].description,
            icon: currentWeather.data.weather[0].icon,
            user: req.session.user.id
        };

        // Save weather data
        await Weather.create(weather);

        // Process forecast data
        const forecastData = forecast.data.list.map(item => ({
            dt: item.dt,
            temp: item.main.temp,
            feels_like: item.main.feels_like,
            humidity: item.main.humidity,
            wind_speed: item.wind.speed,
            description: item.weather[0].description,
            icon: item.weather[0].icon
        }));

        res.render('weather', { 
            weather,
            forecast: forecastData,
            error: null
        });
    } catch (error) {
        console.error('Weather fetch error:', error);
        let errorMessage = 'Failed to fetch weather data';

        if (error.response) {
            switch (error.response.status) {
                case 404:
                    errorMessage = 'City not found. Please check the spelling and try again.';
                    break;
                case 401:
                    errorMessage = 'API key error. Please contact support.';
                    break;
                case 429:
                    errorMessage = 'Too many requests. Please try again later.';
                    break;
            }
        }

        res.render('weather', { 
            weather: null,
            forecast: null,
            error: errorMessage
        });
    }
});

module.exports = router; 
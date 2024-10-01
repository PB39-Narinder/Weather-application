const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const app = express();

const apiKey = require('./private/apikey').key; // Ensure the API key is correctly exported

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.render('index', { weather: null, error: null });
});

app.post('/', (req, res) => {
  const city = req.body.city;
  const url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`; // Use metric units for Celsius

  request(url, (err, response, body) => {
    if (err) {
      console.error('Request error:', err); // Log request error
      res.render('index', { weather: null, error: 'Error, please try again' });
    } else {
      console.log('API response:', body); // Log API response
      try {
        const weather = JSON.parse(body);
        if (weather.cod === '404') {
          res.render('index', { weather: null, error: 'City not found' });
        } else {
          const weatherTextExpanded = {
            city: weather.name,
            temperature: weather.main.temp,
            condition: weather.weather[0].description,
            humidity: weather.main.humidity,
            windSpeed: weather.wind.speed
          };

          res.render('index', { weather: weatherTextExpanded, error: null });
        }
      } catch (e) {
        console.error('Parsing error:', e); // Log parsing error
        res.render('index', { weather: null, error: 'Error parsing weather data' });
      }
    }
  });
});

app.listen(3000, () => {
  console.log('Server listening on http://localhost:3000');
});

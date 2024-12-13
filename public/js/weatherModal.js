document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('weatherModal');
    const closeBtn = document.querySelector('.close-modal');
    const weatherCards = document.querySelectorAll('.weather-card, .favorite-card');

    async function showWeatherDetails(city) {
        try {
            const response = await fetch(`/api/weather/${encodeURIComponent(city)}`);
            const weatherData = await response.json();
            
            // Update modal content
            document.getElementById('modalCity').textContent = weatherData.city;
            document.getElementById('modalIcon').src = `http://openweathermap.org/img/w/${weatherData.icon}.png`;
            document.querySelector('.modal-temperature').textContent = `${weatherData.temperature}°C`;
            document.querySelector('.modal-description').textContent = weatherData.description;
            document.getElementById('modalHumidity').textContent = `${weatherData.humidity}%`;
            document.getElementById('modalWind').textContent = `${weatherData.windSpeed} m/s`;
            document.getElementById('modalPressure').textContent = `${weatherData.pressure} hPa`;
            document.getElementById('modalVisibility').textContent = `${weatherData.visibility / 1000} km`;

            // Update hourly forecast
            const hourlyContainer = document.getElementById('hourlyContainer');
            hourlyContainer.innerHTML = weatherData.hourly.map(hour => `
                <div class="hourly-item">
                    <div class="time">${hour.time}</div>
                    <img src="http://openweathermap.org/img/w/${hour.icon}.png" alt="Weather icon">
                    <div class="temp">${Math.round(hour.temp)}°C</div>
                    <div class="description">${hour.description}</div>
                </div>
            `).join('');

            // Show modal
            modal.classList.add('active');
        } catch (error) {
            console.error('Failed to fetch weather details:', error);
        }
    }

    // Add click event to weather cards
    weatherCards.forEach(card => {
        card.addEventListener('click', function(e) {
            // Don't trigger if clicking favorite button or remove button
            if (e.target.closest('.favorite-btn') || e.target.closest('.remove-favorite-btn')) {
                return;
            }
            const city = this.querySelector('h2, h3').textContent;
            showWeatherDetails(city);
        });
    });

    // Close modal when clicking close button or outside
    closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            modal.classList.remove('active');
        }
    });
}); 
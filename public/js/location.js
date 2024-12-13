function getLocation() {
    if (navigator.geolocation) {
        const locationButton = document.querySelector('.location-button');
        locationButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Getting location...';
        
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const response = await fetch('/weather/location', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            lat: position.coords.latitude,
                            lon: position.coords.longitude
                        })
                    });

                    if (!response.ok) {
                        throw new Error('Failed to fetch weather data');
                    }

                    const contentType = response.headers.get('content-type');
                    if (contentType && contentType.includes('application/json')) {
                        const data = await response.json();
                        if (data.error) {
                            throw new Error(data.error);
                        }
                    }

                    // Redirect to the weather page
                    window.location.href = '/weather';
                } catch (error) {
                    console.error('Error:', error);
                    locationButton.innerHTML = '<i class="fas fa-map-marker-alt"></i> Use my location';
                    alert('Failed to get weather data for your location');
                }
            },
            (error) => {
                console.error('Geolocation error:', error);
                locationButton.innerHTML = '<i class="fas fa-map-marker-alt"></i> Use my location';
                let errorMessage = 'Unable to get your location. ';
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage += 'Please allow location access in your browser settings.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage += 'Location information is unavailable.';
                        break;
                    case error.TIMEOUT:
                        errorMessage += 'Location request timed out.';
                        break;
                    default:
                        errorMessage += 'Please check your browser settings.';
                }
                alert(errorMessage);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    } else {
        alert('Geolocation is not supported by your browser');
    }
} 
async function toggleFavorite(city) {
    try {
        const button = document.querySelector('.favorite-btn');
        const icon = button.querySelector('i');
        const text = button.querySelector('span');

        const response = await fetch('/favorites', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ city })
        });

        const data = await response.json();

        if (data.success) {
            icon.classList.toggle('active');
            text.textContent = icon.classList.contains('active') ? 'Added to Favorites' : 'Add to Favorites';
        } else {
            throw new Error(data.error || 'Failed to update favorites');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to update favorites');
    }
}

async function getWeather(city) {
    try {
        const response = await fetch('/weather', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ city })
        });

        if (response.ok) {
            window.location.href = '/weather';
        } else {
            throw new Error('Failed to fetch weather data');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to fetch weather data');
    }
}

async function removeFavorite(id) {
    if (confirm('Are you sure you want to remove this location from favorites?')) {
        try {
            const response = await fetch(`/favorites/${id}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                window.location.reload();
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to remove favorite');
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Handle favorite toggle
    const favoriteBtn = document.querySelector('.favorite-btn');
    if (favoriteBtn) {
        favoriteBtn.addEventListener('click', async function() {
            const city = this.dataset.city;
            await toggleFavorite(city);
        });
    }

    // Handle favorite removal from favorites page
    const removeBtns = document.querySelectorAll('.remove-favorite-btn');
    removeBtns.forEach(btn => {
        btn.addEventListener('click', async function() {
            const city = this.dataset.city;
            try {
                const response = await fetch('/favorites', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ city })
                });
                
                const data = await response.json();
                if (data.success) {
                    this.closest('.favorite-card').remove();
                    
                    // Check if there are any favorites left
                    const remainingCards = document.querySelectorAll('.favorite-card');
                    if (remainingCards.length === 0) {
                        location.reload(); // Reload to show "no favorites" message
                    }
                }
            } catch (error) {
                console.error('Failed to remove favorite:', error);
            }
        });
    });
}); 
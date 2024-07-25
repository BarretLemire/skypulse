document.getElementById('form-1').addEventListener('submit', function (event) {
    event.preventDefault();
    const location = document.getElementById('location').value;
    getWeatherData(location);
});

async function getWeatherData(location) {
    const [latitude, longitude] = location.split(',');
    const apiBaseUrl = 'https://api.weather.gov';
    try {
        const response = await fetch(`${apiBaseUrl}/points/${latitude.trim()},${longitude.trim()}`);
        const data = await response.json();
        const forecastUrl = data.properties.forecast;
        const forecastHourlyUrl = data.properties.forecastHourly;

        const forecastResponse = await fetch(forecastUrl);
        const forecastData = await forecastResponse.json();
        const forecastHourlyResponse = await fetch(forecastHourlyUrl);
        const forecastHourlyData = await forecastHourlyResponse.json();

        updateCurrentConditions(forecastData.properties.periods[0]);
        updateWeatherAlerts(forecastData.properties.periods);
        updateWeatherChart(forecastHourlyData.properties.periods);
    } catch (error) {
        console.error('Error fetching weather data:', error);
    }
}

function updateCurrentConditions(currentWeather) {
    document.getElementById('current-conditions').innerHTML = `
        <strong>${currentWeather.name}</strong><br>
        ${currentWeather.temperature}°${currentWeather.temperatureUnit}<br>
        ${currentWeather.shortForecast}
    `;
}

function updateWeatherAlerts(forecastPeriods) {
    const alerts = forecastPeriods.filter(period => period.isDaytime && period.shortForecast.includes('Alert'));
    if (alerts.length === 0) {
        document.getElementById('weather-alerts').innerText = 'No current alerts';
    } else {
        document.getElementById('weather-alerts').innerText = alerts.map(alert => alert.shortForecast).join(', ');
    }
}

function updateWeatherChart(hourlyPeriods) {
    const ctx = document.getElementById('weatherChart').getContext('2d');
    const labels = hourlyPeriods.slice(0, 8).map(period => new Date(period.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    const data = hourlyPeriods.slice(0, 8).map(period => period.temperature);

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Temperature (°F)',
                data: data,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

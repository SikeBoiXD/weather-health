let latitude, longitude;

const weatherApiKey = '981c70eb48ff88685559e250604c6ca1';
const uvApiKey = 'openuv-151vorlto3kgo2-io';
const airQualityApiKey = '981c70eb48ff88685559e250604c6ca1';

function getWeather() {
    const locationInput = document.getElementById('location').value;
    if (locationInput.trim() === '') {
        alert('Please enter a location');
        return;
    }

    const weatherApiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${locationInput}&appid=${weatherApiKey}&units=metric`;
    fetch(weatherApiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Weather API request failed');
            }
            return response.json();
        })
        .then(data => {
            document.getElementById('temperature').innerText = `Temperature: ${data.main.temp}°C`;
            document.getElementById('humidity').innerText = `Humidity: ${data.main.humidity}%`;
            document.getElementById('wind').innerText = `Wind Speed: ${data.wind.speed} m/s`;
            document.getElementById('cloud').innerText = `Cloudiness: ${data.clouds.all}%`;
            latitude = data.coord.lat;
            longitude = data.coord.lon;
            document.getElementById('home-page').classList.add('hidden');
            document.getElementById('details-page').classList.remove('hidden');
            document.getElementById('weather-details').classList.remove('hidden');
            document.getElementById('weather-details').style.opacity = 0;
            document.getElementById('health-details').classList.remove('hidden');
            document.getElementById('health-details').style.opacity = 0;
            recommendPrecautions(data.main.temp, data.weather[0].main, data.main.humidity, data.wind.speed);
            fetchUVIndex();
            fetchAirQuality(latitude, longitude, airQualityApiKey);
            setTimeout(() => {
                document.getElementById('weather-details').style.opacity = 1;
                document.getElementById('health-details').style.opacity = 1;
            }, 100);
        })
        .catch(error => {
            console.error('Error fetching weather data:', error);
            alert('Error fetching weather data. Please try again later.');
        });
}
function fetchUVIndex() {
    fetch(`https://api.openuv.io/api/v1/uv?lat=${latitude}&lng=${longitude}`, {
        headers: {
            'x-access-token': uvApiKey
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error fetching UV index data');
            }
            return response.json();
        })
        .then(data => {
            document.getElementById('uv-index').innerText = `UV Index: ${data.result.uv}`;
            fetchAirQuality(latitude, longitude, airQualityApiKey);
        })
        .catch(error => {
            console.error('Error fetching UV index:', error);
            document.getElementById('uv-index').innerText = 'UV Index: Not available';
        });
}
function fetchAirQuality(latitude, longitude, apiKey) {
    fetch(`http://api.openweathermap.org/data/2.5/air_pollution?lat=${latitude}&lon=${longitude}&appid=${apiKey}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Error fetching air quality data');
            }
            return response.json();
        })
        .then(data => {
            console.log('Air quality data:', data);
            if (data && data.list && data.list[0] && data.list[0].main && data.list[0].main.aqi) {
                const aqi = data.list[0].main.aqi;
                document.getElementById('air-quality').innerText = `Air Quality: ${aqi}`;
                advisePrecaution(aqi);
            } else {
                throw new Error('Invalid air quality data structure');
            }
        })
        .catch(error => {
            console.error('Error fetching air quality:', error);
            document.getElementById('air-quality').innerText = 'Air Quality: Not available';
        });
}
function advisePrecaution(aqi) {
    let advice = '';
    if (aqi <= 1) {
        advice = 'Air quality is good. No precautions needed.';
    } else if (aqi <= 2) {
        advice = 'Air quality is moderate. People with respiratory or heart conditions should consider limiting outdoor activities.';
    } else if (aqi <= 3) {
        advice = 'Air quality is unhealthy for sensitive groups. Children, elderly people, and individuals with respiratory or heart conditions should limit prolonged outdoor exertion.';
    } else if (aqi <= 4) {
        advice = 'Air quality is unhealthy. Everyone should avoid prolonged outdoor exertion; people with respiratory or heart conditions should remain indoors.';
    } else if (aqi <= 4.5) {
        advice = 'Air quality is very unhealthy. Everyone should avoid outdoor activities; people with respiratory or heart conditions should remain indoors.';
    } else {
        advice = 'Air quality is hazardous. Everyone should avoid outdoor activities and remain indoors.';
    }
    document.getElementById('air-quality-advice').innerText = advice;
}

function recommendPrecautions(temperature) {
    let precautionAdvice = '';
    if (temperature <= 10) {
        precautionAdvice = 'Consider wearing a mask to protect against cold air. Dress warmly with layers.';
    }
    if (temperature > 10 && temperature <= 15) {
        precautionAdvice = 'Wear a light jacket or sweater to stay comfortable in the cool weather.';
    }
    if (temperature > 15 && temperature <= 25) {
        precautionAdvice = 'Stay hydrated and dress comfortably for the moderate weather conditions.';
    }
    if (temperature > 25 && temperature <= 30) {
        precautionAdvice = 'Avoid prolonged outdoor activities. Use sunscreen and seek shade if outside.';
    }
    if (temperature > 30) {
        precautionAdvice = 'Stay indoors in air-conditioned environments as much as possible. Drink plenty of water.';
    }
    document.getElementById('precaution-advice').innerText = precautionAdvice;
}
function showDetails() {
    getWeather();
}
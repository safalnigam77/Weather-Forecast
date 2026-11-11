
const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const message = document.getElementById("message");

const cityName = document.getElementById("cityName");
const dateElement = document.getElementById("date");
const temperature = document.getElementById("temperature");
const description = document.getElementById("description");
const weatherIcon = document.getElementById("weatherIcon");
const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");
const feelsLike = document.getElementById("feelsLike");
const forecast = document.getElementById("forecast");

// Convert weather codes into descriptions and icons
function getWeatherInfo(code) {
    if (code === 0) return { text: "Clear Sky", icon: "☀️" };
    if (code === 1) return { text: "Mainly Clear", icon: "🌤️" };
    if (code === 2) return { text: "Partly Cloudy", icon: "⛅" };
    if (code === 3) return { text: "Overcast", icon: "☁️" };
    if ([45, 48].includes(code)) return { text: "Foggy", icon: "🌫️" };
    if ([51, 53, 55, 56, 57].includes(code))
        return { text: "Drizzle", icon: "🌦️" };
    if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code))
        return { text: "Rainy", icon: "🌧️" };
    if ([71, 73, 75, 77, 85, 86].includes(code))
        return { text: "Snowy", icon: "❄️" };
    if ([95, 96, 99].includes(code))
        return { text: "Thunderstorm", icon: "⛈️" };

    return { text: "Unknown", icon: "🌡️" };
}

// Search city and get its coordinates
async function getWeather() {
    const city = cityInput.value.trim();

    if (!city) {
        message.textContent = "Please enter a city name.";
        return;
    }

    try {
        message.textContent = "Loading weather...";
        searchBtn.disabled = true;

        const geoURL =
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;

        const geoResponse = await fetch(geoURL);

        if (!geoResponse.ok) {
            throw new Error("Unable to search for this city.");
        }

        const geoData = await geoResponse.json();

        if (!geoData.results || geoData.results.length === 0) {
            throw new Error("City not found. Try another name.");
        }

        const place = geoData.results[0];

        // Get weather using latitude and longitude
        const weatherURL =
            `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=5`;

        const weatherResponse = await fetch(weatherURL);

        if (!weatherResponse.ok) {
            throw new Error("Unable to fetch weather data.");
        }

        const data = await weatherResponse.json();

        displayWeather(place, data);

        message.textContent = "";

    } catch (error) {
        message.textContent = error.message;
    } finally {
        searchBtn.disabled = false;
    }
}

// Display current weather
function displayWeather(place, data) {
    const current = data.current;
    const info = getWeatherInfo(current.weather_code);

    cityName.textContent =
        `${place.name}, ${place.country}`;

    dateElement.textContent =
        new Date(current.time).toLocaleString("en-IN", {
            dateStyle: "full",
            timeStyle: "short"
        });

    temperature.textContent =
        `${Math.round(current.temperature_2m)}°C`;

    description.textContent = info.text;
    weatherIcon.textContent = info.icon;

    humidity.textContent =
        `${current.relative_humidity_2m}%`;

    wind.textContent =
        `${current.wind_speed_10m} km/h`;

    feelsLike.textContent =
        `${Math.round(current.apparent_temperature)}°C`;

    displayForecast(data.daily);
}

// Display five-day forecast
function displayForecast(daily) {
    forecast.innerHTML = "";

    daily.time.forEach((day, index) => {
        const info = getWeatherInfo(daily.weather_code[index]);

        const date = new Date(day + "T00:00:00");

        const dayName = date.toLocaleDateString("en-US", {
            weekday: "short"
        });

        const card = document.createElement("div");
        card.className = "forecast-card";

        const dayText = document.createElement("p");
        dayText.textContent = dayName;

        const icon = document.createElement("span");
        icon.textContent = info.icon;

        const condition = document.createElement("p");
        condition.textContent = info.text;

        const maxTemp = document.createElement("h3");
        maxTemp.textContent =
            `${Math.round(daily.temperature_2m_max[index])}°`;

        const minTemp = document.createElement("p");
        minTemp.textContent =
            `${Math.round(daily.temperature_2m_min[index])}°`;

        card.append(dayText, icon, condition, maxTemp, minTemp);
        forecast.appendChild(card);
    });
}

// Search button click
searchBtn.addEventListener("click", getWeather);

// Search using Enter key
cityInput.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        getWeather();
    }
});

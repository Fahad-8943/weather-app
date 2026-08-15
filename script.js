// =========================================================
// WEATHER APP CONTROLLER
// =========================================================

// Map Open-Meteo WMO weather codes to human-readable text
const getWeatherCondition = (code) => {
  const codes = {
    0: "Clear Sky",
    1: "Mainly Clear",
    2: "Partly Cloudy",
    3: "Overcast",
    45: "Foggy",
    48: "Depositing Fog",
    51: "Light Drizzle",
    53: "Moderate Drizzle",
    55: "Dense Drizzle",
    61: "Slight Rain",
    63: "Moderate Rain",
    65: "Heavy Rain",
    71: "Slight Snow",
    73: "Moderate Snow",
    75: "Heavy Snow",
    80: "Rain Showers",
    81: "Moderate Showers",
    82: "Violent Showers",
    95: "Thunderstorm",
    96: "Thunderstorm with Hail",
    99: "Heavy Thunderstorm with Hail",
  };
  return codes[code] || "Cloudy";
};

// Map Open-Meteo WMO weather codes to animated SVG weather icons
const getWeatherIcon = (code, isDay = 1) => {
  // Clear Sky
  if (code === 0) {
    return isDay
      ? "./assets/icons/clear-day.svg"
      : "./assets/icons/clear-night.svg";
  }
  // Mainly Clear / Partly Cloudy
  if (code === 1 || code === 2) {
    return isDay
      ? "./assets/icons/partly-cloudy-day.svg"
      : "./assets/icons/partly-cloudy-night.svg";
  }
  // Overcast
  if (code === 3) {
    return isDay
      ? "./assets/icons/overcast-day.svg"
      : "./assets/icons/overcast.svg";
  }
  // Fog
  if (code === 45 || code === 48) {
    return isDay
      ? "./assets/icons/fog-day.svg"
      : "./assets/icons/fog.svg";
  }
  // Drizzle
  if (code >= 51 && code <= 57) {
    return "./assets/icons/drizzle.svg";
  }
  // Rain / Showers
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) {
    return "./assets/icons/rain.svg";
  }
  // Snow / Snow Showers
  if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) {
    return "./assets/icons/snow.svg";
  }
  // Thunderstorm
  if (code >= 95 && code <= 99) {
    return isDay
      ? "./assets/icons/thunderstorms-day-rain.svg"
      : "./assets/icons/thunderstorms-night-rain.svg";
  }

  return isDay
    ? "./assets/icons/clear-day.svg"
    : "./assets/icons/clear-night.svg";
};

// Map Open-Meteo WMO weather codes and is_day to dynamic atmospheric themes
const setWeatherTheme = (code, isDay = 1) => {
  const main = document.getElementById("main");
  if (!main) return;
  const isDaytime = Number(isDay) === 1;

  // Preserve light-theme if active
  const isLight = main.classList.contains("light-theme");

  main.className = main.className
    .split(" ")
    .filter((c) => !c.startsWith("theme-") && c !== "light-theme")
    .join(" ")
    .trim();

  let themeClass = "theme-clear-day";

  // Clear Sky
  if (code === 0) {
    themeClass = isDaytime ? "theme-clear-day" : "theme-clear-night";
  }
  // Mainly Clear / Partly Cloudy / Overcast
  else if (code >= 1 && code <= 3) {
    themeClass = isDaytime ? "theme-clouds-day" : "theme-clouds-night";
  }
  // Fog
  else if (code === 45 || code === 48) {
    themeClass = "theme-fog";
  }
  // Drizzle / Rain / Showers
  else if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) {
    themeClass = "theme-rain";
  }
  // Snow / Snow Showers
  else if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) {
    themeClass = "theme-snow";
  }
  // Thunderstorm
  else if (code >= 95 && code <= 99) {
    themeClass = "theme-thunderstorm";
  }

  main.classList.add(themeClass);
  if (isLight) {
    main.classList.add("light-theme");
  }
};

// Get AQI Status text and badge color
const getAqiStatus = (aqi) => {
  if (aqi === null || aqi === undefined || isNaN(aqi)) {
    return { label: "--", color: "rgba(255,255,255,0.2)" };
  }
  if (aqi <= 20) return { label: "Good", color: "#22c55e" };
  if (aqi <= 40) return { label: "Fair", color: "#84cc16" };
  if (aqi <= 60) return { label: "Moderate", color: "#eab308" };
  if (aqi <= 80) return { label: "Poor", color: "#f97316" };
  return { label: "Very Poor", color: "#ef4444" };
};

// =========================================================
// CORE DATA FETCH & RENDERER
// =========================================================
const fetchWeatherData = async (latitude, longitude, cityName, adminRegion, countryCode) => {
  try {
    // 1. Fetch Weather Forecast
    const responseWeather = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,wind_speed_10m_max,wind_direction_10m_dominant,sunrise,sunset,precipitation_probability_max,rain_sum&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,weather_code,pressure_msl,visibility,wind_speed_10m,wind_gusts_10m,wind_direction_10m&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,wind_speed_10m,wind_direction_10m,pressure_msl,surface_pressure,wind_gusts_10m,cloud_cover,is_day&timezone=auto`
    );

    if (!responseWeather.ok) {
      throw new Error(`Weather API error: ${responseWeather.status}`);
    }

    const tempData = await responseWeather.json();

    // 2. Fetch Air Quality (Non-blocking)
    let airData = null;
    try {
      const responseAir = await fetch(
        `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&current=european_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,dust,uv_index&hourly=uv_index&timezone=auto`
      );
      if (responseAir.ok) {
        airData = await responseAir.json();
      }
    } catch (airError) {
      console.warn("Air quality data unavailable:", airError.message);
    }

    // 3. Update Date & Location Header
    const formattedLocation = adminRegion
      ? `${cityName}, ${adminRegion}`
      : cityName;

    const locationCityEl = document.getElementById("Location-city");
    if (locationCityEl) {
      locationCityEl.innerHTML = `<i class="bx bx-location"></i> <span id="weather-city">${formattedLocation}</span> | <span id="weather-country">${countryCode || "LIVE"}</span>`;
    }

    const date = new Date(tempData.current.time);
    const dateFormatted = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    const weatherDateEl = document.getElementById("weather-date");
    if (weatherDateEl) {
      weatherDateEl.innerHTML = dateFormatted;
    }

    // Format 12-hour time
    let hours = date.getHours();
    let minutes = date.getMinutes();
    let session = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    hours = hours < 10 ? "0" + hours : hours;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    const timeFormatted = `${hours}:${minutes} ${session}`;

    // 4. Render Current Weather Card
    const currentWeatherEl = document.getElementById("current-weather");
    currentWeatherEl.classList.remove("is-loading");
    currentWeatherEl.innerHTML = `
      <div class="current-weather-header">
        <p id="current-weather-title">NOW</p>
        <p class="weather-time" id="weather-time">${timeFormatted}</p>
      </div>

      <!-- Current Weather Hero (Temperature + Animated SVG) -->
      <div class="current-weather-hero">
        <div class="temperature">
          <h1>
            <span id="current-temperature">${tempData.current.temperature_2m}</span><sup>°C</sup>
          </h1>
          <p class="weather-condition">
            ${getWeatherCondition(tempData.current.weather_code)}
          </p>
          <p class="feels-like">
            Feels like
            <span id="feels-like-temperature">${tempData.current.apparent_temperature}</span><sup>°C</sup>
          </p>
        </div>

        <div class="weather-icon">
          <img src="${getWeatherIcon(tempData.current.weather_code, tempData.current.is_day)}" alt="Current weather condition">
        </div>
      </div>

      <!-- Weather Statistics -->
      <div class="weather-stats">
        <div class="other-details">
          <p class="detail-label">Rain</p>
          <i class="bx bx-water-drop" aria-hidden="true"></i>
          <p class="detail-value">
            <span id="rain-value">${tempData.current.rain}</span> mm
          </p>
        </div>

        <div class="other-details">
          <p class="detail-label">Wind</p>
          <i class="bx bx-wind" aria-hidden="true"></i>
          <p class="detail-value">
            <span id="wind-value">${tempData.current.wind_speed_10m}</span> km/h
          </p>
        </div>

        <div class="other-details">
          <p class="detail-label">Pressure</p>
          <i class="bx bx-tachometer-alt" aria-hidden="true"></i>
          <p class="detail-value">
            <span id="pressure-value">${tempData.current.pressure_msl}</span> hPa
          </p>
        </div>
      </div>

      <!-- Today's High / Low -->
      <div class="high-low">
        <div>
          <h3>
            <i class="bx bx-arrow-up" aria-hidden="true"></i>
            <span id="today-high">${tempData.daily.temperature_2m_max[0]}</span>
            <sup>°C</sup>
          </h3>
          <p>High today</p>
        </div>

        <div>
          <h3>
            <i class="bx bx-arrow-down" aria-hidden="true"></i>
            <span id="today-low">${tempData.daily.temperature_2m_min[0]}</span>
            <sup>°C</sup>
          </h3>
          <p>Low today</p>
        </div>
      </div>
    `;

    // 5. Update Dynamic Background Theme
    setWeatherTheme(tempData.current.weather_code, tempData.current.is_day);

    const currentHourIso = tempData.current.time.slice(0, 13) + ":00";
    let startingIndex = tempData.hourly.time.indexOf(currentHourIso);
    if (startingIndex === -1) startingIndex = 0;

    // 6. Update Weather Details (6 Metric Cards)
    document.getElementById("humidity").innerHTML = tempData.current.relative_humidity_2m;
    document.getElementById("wind-speed").innerHTML = tempData.current.wind_speed_10m;
    document.getElementById("wind-direction").innerHTML = tempData.current.wind_direction_10m;

    const rawVis = tempData.hourly?.visibility?.[startingIndex];
    document.getElementById("visibility").innerHTML =
      rawVis !== undefined && rawVis !== null ? (rawVis / 1000).toFixed(1) : "--";

    document.getElementById("cloud-cover").innerHTML = tempData.current.cloud_cover ?? "--";

    const rawUv = airData?.current?.uv_index ?? airData?.hourly?.uv_index?.[startingIndex];
    document.getElementById("uv-index").innerHTML =
      rawUv !== undefined && rawUv !== null ? Number(rawUv).toFixed(1) : "--";

    // 7. Update Sunrise Time (12-Hour AM/PM)
    const sunrise = tempData.daily.sunrise[0];
    const [, sunriseTime] = sunrise.split("T");
    let [sunriseHours, sunriseMinutes] = sunriseTime.split(":");
    sunriseHours = Number(sunriseHours);
    const sunriseSession = sunriseHours >= 12 ? "PM" : "AM";
    sunriseHours = sunriseHours % 12 || 12;
    sunriseHours = sunriseHours < 10 ? "0" + sunriseHours : sunriseHours;
    sunriseMinutes = sunriseMinutes < 10 ? "0" + sunriseMinutes : sunriseMinutes;
    document.getElementById("sunrise-time").innerHTML = `${sunriseHours}:${sunriseMinutes} ${sunriseSession}`;

    // 8. Update Sunset Time (12-Hour AM/PM)
    const sunset = tempData.daily.sunset[0];
    const [, sunsetTime] = sunset.split("T");
    let [sunsetHours, sunsetMinutes] = sunsetTime.split(":");
    sunsetHours = Number(sunsetHours);
    const sunsetSession = sunsetHours >= 12 ? "PM" : "AM";
    sunsetHours = sunsetHours % 12 || 12;
    sunsetHours = sunsetHours < 10 ? "0" + sunsetHours : sunsetHours;
    sunsetMinutes = sunsetMinutes < 10 ? "0" + sunsetMinutes : sunsetMinutes;
    document.getElementById("sunset-time").innerHTML = `${sunsetHours}:${sunsetMinutes} ${sunsetSession}`;

    // 9. Update Air Quality Values & Status Badge
    const aqi = airData?.current?.european_aqi;
    document.getElementById("aqi-value").innerHTML = aqi ?? "--";
    document.getElementById("pm25-value").innerHTML = airData?.current?.pm2_5 ?? "--";
    document.getElementById("pm10-value").innerHTML = airData?.current?.pm10 ?? "--";

    const aqiStatus = getAqiStatus(aqi);
    const aqiStatusEl = document.getElementById("aqi-status");
    if (aqiStatusEl) {
      aqiStatusEl.textContent = aqiStatus.label;
      aqiStatusEl.style.backgroundColor = aqiStatus.color + "33";
      aqiStatusEl.style.color = aqiStatus.color;
      aqiStatusEl.style.borderColor = aqiStatus.color + "88";
    }

    // 10. Update Hourly Forecast (Next 8 Hours)
    const hourlyWeather = document.getElementById("hourly-weather");
    hourlyWeather.innerHTML = `
      <div class="section-heading">
        <h2 id="hourly-weather-title">Hourly Forecast</h2>
      </div>
      <div class="hourly-scroll-container" id="hourly-scroll-container"></div>
    `;

    const hourlyContainer = document.getElementById("hourly-scroll-container");
    const maxHours = Math.min(startingIndex + 8, tempData.hourly.time.length);
    const currentDateIso = tempData.current.time.slice(0, 10);

    for (let i = startingIndex; i < maxHours; i++) {
      const fullTime = tempData.hourly.time[i];
      const [itemDateIso, rawTime] = fullTime.split("T");
      let [hourString, minute] = rawTime.split(":");
      let hour = Number(hourString);
      let session = hour >= 12 ? "PM" : "AM";
      let displayHour = hour % 12 || 12;
      const displayTime = `${displayHour}:${minute} ${session}`;

      const article = document.createElement("article");
      article.className = "forecast-item";
      if (i === startingIndex) {
        article.classList.add("forecast-item-now");
      }

      const timeWrapper = document.createElement("div");
      timeWrapper.className = "forecast-time-wrapper";

      if (i === startingIndex) {
        timeWrapper.innerHTML = `<span class="forecast-time">Now</span>`;
      } else if (itemDateIso !== currentDateIso) {
        timeWrapper.innerHTML = `<span class="forecast-time">${displayTime}</span><span class="forecast-subday">Tom</span>`;
      } else {
        timeWrapper.innerHTML = `<span class="forecast-time">${displayTime}</span>`;
      }

      const isDayHour = hour >= 6 && hour < 19 ? 1 : 0;
      const hourlyIconSrc = getWeatherIcon(tempData.hourly.weather_code[i], isDayHour);

      const icon = document.createElement("img");
      icon.className = "forecast-icon";
      icon.src = hourlyIconSrc;
      icon.alt = "Hourly weather condition";

      const temperature = document.createElement("p");
      temperature.className = "forecast-temperature";
      const temperatureValue = document.createElement("span");
      temperatureValue.className = "hourly-temperature";
      temperatureValue.textContent = Math.round(tempData.hourly.temperature_2m[i]);
      temperature.append(temperatureValue, "°C");

      const precipitation = document.createElement("p");
      precipitation.className = "forecast-condition";
      const precipitationValue = document.createElement("span");
      precipitationValue.className = "precipitation-probability";
      const precipProb = tempData.hourly.precipitation_probability?.[i] ?? 0;
      precipitationValue.textContent = precipProb;
      precipitation.append(precipitationValue, "%");

      article.append(timeWrapper, icon, temperature, precipitation);
      hourlyContainer.appendChild(article);
    }

    // 11. Update 5-Day Forecast
    const forecastContainer = document.getElementById("fiveday-forecast");
    forecastContainer.innerHTML = `
      <div class="section-heading">
        <h2 id="fiveday-forecast-title">5-Day Forecast</h2>
      </div>
      <div class="fiveday-cards-container" id="fiveday-cards-container"></div>
    `;

    const fivedayContainer = document.getElementById("fiveday-cards-container");
    for (let i = 0; i < 5; i++) {
      const dateString = tempData.daily.time[i];
      const maxTemp = Math.round(tempData.daily.temperature_2m_max[i]);
      const minTemp = Math.round(tempData.daily.temperature_2m_min[i]);
      const weatherCode = tempData.daily.weather_code[i];
      const conditionText = getWeatherCondition(weatherCode);
      const iconSrc = getWeatherIcon(weatherCode, 1);

      let dayName;
      if (i === 0) {
        dayName = "Today";
      } else {
        const d = new Date(dateString + "T00:00:00");
        dayName = d.toLocaleDateString("en-US", { weekday: "short" });
      }

      const article = document.createElement("article");
      article.className = "forecast-item";

      article.innerHTML = `
        <p class="forecast-day">${dayName}</p>
        <img class="forecast-icon" src="${iconSrc}" alt="${conditionText}">
        <p class="forecast-temperature">
          <span class="forecast-high">${maxTemp}°C</span> /
          <span class="forecast-low">${minTemp}°C</span>
        </p>
        <p class="forecast-condition">${conditionText}</p>
      `;

      fivedayContainer.appendChild(article);
    }
  } catch (error) {
    console.error("Weather Error:", error.message);
  } finally {
    const searchBtn = document.getElementById("search-btn");
    if (searchBtn) {
      searchBtn.innerHTML = "Search";
      searchBtn.disabled = false;
    }
  }
};

// =========================================================
// SEARCH BY CITY NAME
// =========================================================
const weather = async (forcedQuery = null) => {
  try {
    const searchInput = document.getElementById("Search");
    let city = forcedQuery || searchInput.value;

    if (!city || city.trim() === "") {
      alert("Please enter a city name");
      return;
    }

    const searchBtn = document.getElementById("search-btn");
    if (searchBtn) {
      searchBtn.innerHTML = `<i class="bx bx-loader-alt bx-spin"></i>`;
      searchBtn.disabled = true;
    }

    searchInput.blur();

    const responseGeocoding = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
        city.trim(),
      )}&count=10&language=en&format=json`
    );

    if (!responseGeocoding.ok) {
      throw new Error(`Geocoding API error: ${responseGeocoding.status}`);
    }

    const cityData = await responseGeocoding.json();

    if (!cityData.results || cityData.results.length === 0) {
      alert("Location not found! Try typing the country or state name.");
      if (searchBtn) {
        searchBtn.innerHTML = "Search";
        searchBtn.disabled = false;
      }
      return;
    }

    // Population-weighted selection to disambiguate cities (e.g. Kochi India vs Kochi Japan)
    const bestMatch = cityData.results.reduce((prev, curr) => {
      return (curr.population || 0) > (prev.population || 0) ? curr : prev;
    }, cityData.results[0]);

    const latitude = bestMatch.latitude;
    const longitude = bestMatch.longitude;
    const cityName = bestMatch.name;
    const adminRegion = bestMatch.admin1 || "";
    const countryCode = bestMatch.country_code || "";

    await fetchWeatherData(latitude, longitude, cityName, adminRegion, countryCode);
  } catch (error) {
    console.error("Search Error:", error.message);
    const searchBtn = document.getElementById("search-btn");
    if (searchBtn) {
      searchBtn.innerHTML = "Search";
      searchBtn.disabled = false;
    }
  }
};

// =========================================================
// GET LIVE GPS LOCATION
// =========================================================
const getLiveLocation = () => {
  if (!navigator.geolocation) {
    weather("London");
    return;
  }

  const searchInput = document.getElementById("Search");
  if (searchInput) searchInput.placeholder = "Locating your area...";

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude } = position.coords;
      let cityName = "My Location";
      let adminRegion = "";
      let countryCode = "GPS";

      // Reverse geocoding via free client API
      try {
        const reverseRes = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
        );
        if (reverseRes.ok) {
          const revData = await reverseRes.json();
          cityName = revData.city || revData.locality || "My Location";
          adminRegion = revData.principalSubdivision || "";
          countryCode = revData.countryCode || "GPS";
        }
      } catch (e) {
        console.warn("Reverse geocoding error:", e.message);
      }

      if (searchInput) searchInput.placeholder = "Search for a city...";
      await fetchWeatherData(latitude, longitude, cityName, adminRegion, countryCode);
    },
    (error) => {
      console.warn("GPS Notice:", error.message);
      if (searchInput) searchInput.placeholder = "Search for a city...";
      // Fallback to London on failure if not already loaded
      weather("London");
    },
    { timeout: 8000 }
  );
};

// =========================================================
// THEME TOGGLE (LIGHT / DARK)
// =========================================================
const toggleTheme = () => {
  const main = document.getElementById("main");
  const moonIcon = document.getElementById("theme-moon");
  const sunIcon = document.getElementById("theme-sun");

  if (!main) return;

  const isLight = main.classList.toggle("light-theme");
  if (moonIcon && sunIcon) {
    moonIcon.style.display = isLight ? "none" : "inline-block";
    sunIcon.style.display = isLight ? "inline-block" : "none";
  }
};

// =========================================================
// EVENT LISTENERS & AUTO-INITIALIZATION
// =========================================================

// Search on Enter key press
document.getElementById("Search").addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    weather();
  }
});

// Search on Button click
document.getElementById("search-btn").addEventListener("click", () => weather());

// GPS Location button in search bar
const geoBtn = document.getElementById("geo-btn");
if (geoBtn) {
  geoBtn.addEventListener("click", getLiveLocation);
}

// Sidebar Location icon
const navLocationBtn = document.getElementById("nav-location");
if (navLocationBtn) {
  navLocationBtn.addEventListener("click", getLiveLocation);
}

// Theme Toggle button in sidebar
const themeToggleBtn = document.getElementById("theme-toggle");
if (themeToggleBtn) {
  themeToggleBtn.addEventListener("click", toggleTheme);
}

// Auto-load weather instantly on startup
window.addEventListener("DOMContentLoaded", () => {
  if (navigator.geolocation) {
    getLiveLocation();
  } else {
    weather("London");
  }
});

const weather = async () => {
  try {
    // =========================
    // 1. GET SEARCH VALUE
    // =========================

    let city = document.getElementById("Search").value;

    // Validate city input
    if (!city || city.trim() === "") {
      alert("Please enter a city name");
      return;
    }

    // =========================
    // 2. GET LOCATION DATA
    // =========================

    let response1 = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=en&format=json`,
    );

    if (!response1.ok) {
      throw new Error(`Geocoding API error: ${response1.status}`);
    }

    let cityData = await response1.json();

    // Validate location data exists
    if (!cityData.results || cityData.results.length === 0) {
      alert("City not found. Please try another search.");
      return;
    }

    let latitude = cityData.results[0].latitude;
    let longitude = cityData.results[0].longitude;
    let countryCode = cityData.results[0].country_code;

    // =========================
    // 3. UPDATE LOCATION
    // =========================

    // =========================
    // 4. GET WEATHER DATA
    // =========================

    let response2 = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,wind_speed_10m_max,wind_direction_10m_dominant,sunrise,sunset,precipitation_probability_max,rain_sum&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,weather_code,pressure_msl,visibility,wind_speed_10m,wind_gusts_10m,wind_direction_10m&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,wind_speed_10m,wind_direction_10m,pressure_msl,surface_pressure,wind_gusts_10m,cloud_cover&timezone=auto`,
    );

    if (!response2.ok) {
      throw new Error(`Weather API error: ${response2.status}`);
    }

    let tempData = await response2.json();

    // Validate weather data
    if (!tempData.current || !tempData.daily || !tempData.hourly) {
      throw new Error("Invalid weather data received");
    }

    // =========================
    // 5. GET AIR QUALITY DATA
    // =========================

    let response3 = await fetch(
      `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&hourly=pm10,pm2_5,uv_index&current=european_aqi,pm10,pm2_5&timezone=auto`,
    );

    if (!response3.ok) {
      throw new Error(`Air Quality API error: ${response3.status}`);
    }

    let airData = await response3.json();

    // Validate air quality data
    if (!airData.current || !airData.hourly) {
      throw new Error("Invalid air quality data received");
    }

    // =========================
    // 6. DATE & TIME
    // =========================

    let dateObj = new Date(tempData.current.time);

    let date = `${dateObj.getFullYear()}-${String(
      dateObj.getMonth() + 1,
    ).padStart(2, "0")}-${String(dateObj.getDate()).padStart(2, "0")}`;

    let hours = dateObj.getHours();
    let minutes = dateObj.getMinutes();

    let session = "AM";

    if (hours > 12) {
      hours -= 12;
      session = "PM";
    }

    hours = hours < 10 ? "0" + hours : hours;
    minutes = minutes < 10 ? "0" + minutes : minutes;

    let time = hours + ":" + minutes + " " + session;

    // =========================
    // 7. UPDATE DATE & TIME
    // =========================

    document.getElementById("country-code").innerHTML =
      `               <div class="weather-location-details">
                        <p id="Location-city"> <i class="bx bx-location"></i> <span id="weather-city">${city}</span> |
                            <span id="weather-country">${countryCode}</span>
                        </p>
                    </div>
                    <div class="weather-location-details">
                        <p id="weather-date">${date}</p>
                    </div>`;

    // =========================
    // 8. UPDATE CURRENT WEATHER
    // =========================

    // document.getElementById("current-temperature").innerHTML =
    //   tempData.current.temperature_2m;

    // document.getElementById("feels-like-temperature").innerHTML =
    // tempData.current.apparent_temperature;

    // document.getElementById("rain-value").innerHTML = tempData.current.rain;

    // document.getElementById("wind-value").innerHTML =
    //   tempData.current.wind_speed_10m;

    // document.getElementById("pressure-value").innerHTML =
    //   tempData.current.pressure_msl;

    // =========================
    // 9. UPDATE HIGH / LOW
    // =========================

    // document.getElementById("today-high").innerHTML =
    //   tempData.daily.temperature_2m_max[0];

    // document.getElementById("today-low").innerHTML =
    //   tempData.daily.temperature_2m_min[0];

    document.getElementById("current-weather").innerHTML = `
    <div class="current-weather-header">

                    <p id="current-weather-title">NOW</p>

                    <p class="weather-time" id="weather-time">${time}</p>

                </div>


                <!-- Temperature -->
                <div class="temperature">

                    <h1>
                        <span id="current-temperature">${tempData.current.temperature_2m}</span><sup>°C</sup>
                    </h1>

                    <p class="weather-condition">
                        Pretty cloudy
                    </p>

                    <p class="feels-like">
                        Feels like
                        <span id="feels-like-temperature">${tempData.current.apparent_temperature}</span><sup>°C</sup>
                    </p>

                </div>


                <!-- Weather Icon -->
                <div class="weather-icon">

                    <img src="./assets/logo.png" alt="Current weather condition" width="150">

                </div>


                <!-- Weather Statistics -->
                <div class="weather-stats">

                    <!-- Rain -->
                    <div class="other-details">

                        <p class="detail-label">Rain</p>

                        <i class="bx bx-cloud-rain" aria-hidden="true"></i>

                        <p class="detail-value">
                            <span id="rain-value">${tempData.current.rain}</span>mm
                        </p>

                    </div>


                    <!-- Wind -->
                    <div class="other-details">

                        <p class="detail-label">Wind</p>

                        <i class="bx bx-wind" aria-hidden="true"></i>

                        <p class="detail-value">
                            <span id="wind-value">${tempData.current.wind_speed_10m}</span> km/h
                        </p>

                    </div>


                    <!-- Pressure -->
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

    // ==========================
    // 10. weather - details
    // ==========================

    document.getElementById("humidity").innerHTML =
      tempData.current.relative_humidity_2m;

    document.getElementById("wind-speed").innerHTML =
      tempData.current.wind_speed_10m;

    document.getElementById("wind-direction").innerHTML =
      tempData.current.wind_direction_10m;

    document.getElementById("visibility").innerHTML =
      tempData.hourly.visibility[0];

    document.getElementById("cloud-cover").innerHTML =
      tempData.current.cloud_cover;

    const timestamp = tempData.current.time.slice(0, 14) + "00";
    const index = airData.hourly.time.indexOf(timestamp);

    if (index !== -1) {
      document.getElementById("uv-index").innerHTML =
        airData.hourly.uv_index[index];
    } else {
      document.getElementById("uv-index").innerHTML = "--";
    }

    // ==========================
    // 11. sun set and rise
    // ==========================

    let sunriseobj = new Date(tempData.daily.sunrise[0]);

    let sunrise_hours = sunriseobj.getHours();
    let sunrise_minutes = sunriseobj.getMinutes();
    let sunrise_session = "AM";

    if (sunrise_hours > 12) {
      sunrise_hours -= 12;
      sunrise_session = "PM";
    }

    sunrise_hours = sunrise_hours < 10 ? "0" + sunrise_hours : sunrise_hours;
    sunrise_minutes =
      sunrise_minutes < 10 ? "0" + sunrise_minutes : sunrise_minutes;

    let sunrise = sunrise_hours + ":" + sunrise_minutes + " " + sunrise_session;

    document.getElementById("sunrise-time").innerHTML = sunrise;

    let sunsetobj = new Date(tempData.daily.sunset[0]);

    let sunset_hours = sunsetobj.getHours();
    let sunset_minutes = sunsetobj.getMinutes();
    let sunset_session = "AM";

    if (sunset_hours > 12) {
      sunset_hours -= 12;
      sunset_session = "PM";
    }

    sunset_hours = sunset_hours < 10 ? "0" + sunset_hours : sunset_hours;
    sunset_minutes =
      sunset_minutes < 10 ? "0" + sunset_minutes : sunset_minutes;

    let sunset = sunset_hours + ":" + sunset_minutes + " " + sunset_session;
    document.getElementById("sunset-time").innerHTML = sunset;

    // ==========================
    // 12. air quality
    // ==========================
    document.getElementById("aqi-value").innerHTML =
      airData.current.european_aqi;

    document.getElementById("pm25-value").innerHTML = airData.current.pm2_5;

    document.getElementById("pm10-value").innerHTML = airData.current.pm10;

    // =========================
    // 13. Hourly weather
    // =========================

    const hourlyWeather = document.getElementById("hourly-weather");

    // Clear previous hourly data
    hourlyWeather.innerHTML =
      '<div class="section-heading"><h2 id="hourly-weather-title">Hourly Forecast</h2></div>';

    const currentTime = tempData.current.time;

    // Find the current hour
    const startingIndex = tempData.hourly.time.indexOf(
      currentTime.slice(0, 14) + "00",
    );

    if (startingIndex === -1) {
      console.warn("Current hour not found in hourly data");
    } else {
      // Current date
      const currentDate = tempData.hourly.time[startingIndex].split("T")[0];

      // Generate hourly cards
      for (let i = startingIndex; i < tempData.hourly.time.length; i++) {
        const fullTime = tempData.hourly.time[i];

        const [date, rawTime] = fullTime.split("T");

        // Stop when tomorrow starts
        if (date !== currentDate) {
          break;
        }

        // Convert 24-hour time
        let [hourString, minute] = rawTime.split(":");

        let hour = Number(hourString);
        let session;

        if (hour === 0) {
          hour = 12;
          session = "AM";
        } else if (hour < 12) {
          session = "AM";
        } else if (hour === 12) {
          session = "PM";
        } else {
          hour -= 12;
          session = "PM";
        }

        const displayTime = `${hour}:${minute} ${session}`;

        // Create article
        const article = document.createElement("article");
        article.className = "forecast-item";

        // Time
        const time = document.createElement("p");
        time.className = "forecast-time";
        time.textContent = i === startingIndex ? "Now" : displayTime;

        // Weather icon placeholder
        const icon = document.createElement("img");
        icon.className = "forecast-icon";
        icon.src = "./assets/logo.png";
        icon.alt = "Weather condition";

        // Temperature
        const temperature = document.createElement("p");
        temperature.className = "forecast-temperature";

        const temperatureValue = document.createElement("span");
        temperatureValue.className = "hourly-temperature";
        temperatureValue.textContent = tempData.hourly.temperature_2m[i];

        temperature.append(temperatureValue, "°C");

        // Rain probability
        const precipitation = document.createElement("p");
        precipitation.className = "forecast-condition";

        const precipitationValue = document.createElement("span");
        precipitationValue.className = "precipitation-probability";
        precipitationValue.textContent =
          tempData.hourly.precipitation_probability[i];

        precipitation.append(precipitationValue, "%");

        // Put everything inside article
        article.append(time, icon, temperature, precipitation);

        // Add card to section
        hourlyWeather.appendChild(article);
      }
    }
  } catch (error) {
    console.error("Weather Error:", error.message);
    alert("Error fetching weather data: " + error.message);
  }
};

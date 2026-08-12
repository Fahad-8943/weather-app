const weather = async () => {
  // =========================
  // 1. GET SEARCH VALUE
  // =========================

  let city = document.getElementById("Search").value;

  // =========================
  // 2. GET LOCATION DATA
  // =========================

  let response1 = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=en&format=json`,
  );

  let cityData = await response1.json();

  let latitude = cityData.results[0].latitude;
  let longitude = cityData.results[0].longitude;
  let countryCode = cityData.results[0].country_code;
  let timezone = cityData.results[0].timezone;

  // =========================
  // 3. UPDATE LOCATION
  // =========================

  // document.getElementById("weather-city").innerHTML = city;
  // document.getElementById("weather-country").innerHTML = countryCode;

  // =========================
  // 4. GET WEATHER DATA
  // =========================

  let response2 = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,wind_speed_10m_max,wind_direction_10m_dominant,sunrise,sunset,precipitation_probability_max,rain_sum&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,weather_code,pressure_msl,visibility,wind_speed_10m,wind_gusts_10m,wind_direction_10m&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,wind_speed_10m,wind_direction_10m,pressure_msl,surface_pressure,wind_gusts_10m,cloud_cover&timezone=${timezone}`,
  );

  let tempData = await response2.json();

  // =========================
  // 5. GET AIR QUALITY DATA
  // =========================

  let response3 = await fetch(
    `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&hourly=pm10,pm2_5&current=european_aqi,pm10,pm2_5&timezone=${timezone}`,
  );

  let airData = await response3.json();

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

  // document.getElementById("weather-date").innerHTML = date;
  document.getElementById("country-code").innerHTML =
    `               <div class="weather-location-details">
                        <p id="Location-city"> <i class="bx bx-location"></i> <span id="weather-city">${city}</span> |
                            <span id="weather-country">${countryCode}</span>
                        </p>
                    </div>
                    <div class="weather-location-details">
                        <p id="weather-date">${date}</p>
                    </div>`;

  // document.getElementById("weather-time").innerHTML = time;

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
                            <span id="rain-value">${tempData.current.rain}</span>%
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
  // weather - details
  // ==========================

  document.getElementById("humidity").innerHTML = tempData.current.relative_humidity_2m;



  // =========================
  // 10. DEBUG / CHECK DATA
  // =========================

  // console.log(countryCode);
  // console.log(tempData.current.temperature_2m);
  // console.log(tempData.current.relative_humidity_2m);
  // console.log(tempData.current.wind_speed_10m);
  // console.log(tempData.current.weather_code);
  // console.log(airData.current.pm10);
  // console.log(airData.current.pm2_5);
  // console.log(airData.current.european_aqi);
};

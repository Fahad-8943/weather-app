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

  document.getElementById("weather-city").innerHTML = city;
  document.getElementById("weather-country").innerHTML = countryCode;

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

  document.getElementById("weather-date").innerHTML = date;
  document.getElementById("weather-time").innerHTML = time;

  // =========================
  // 8. UPDATE CURRENT WEATHER
  // =========================

  document.getElementById("current-temperature").innerHTML =
    tempData.current.temperature_2m;

  document.getElementById("feels-like-temperature").innerHTML =
    tempData.current.apparent_temperature;

  document.getElementById("rain-value").innerHTML = tempData.current.rain;

  document.getElementById("wind-value").innerHTML =
    tempData.current.wind_speed_10m;

  document.getElementById("pressure-value").innerHTML =
    tempData.current.pressure_msl;

  // =========================
  // 9. UPDATE HIGH / LOW
  // =========================

  document.getElementById("today-high").innerHTML =
    tempData.daily.temperature_2m_max[0];

  document.getElementById("today-low").innerHTML =
    tempData.daily.temperature_2m_min[0];

  // ==========================
  // weather - details
  // ==========================

  document.getElementById('humidity').innerHTML = tempData.current.relative_humidity_2m



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

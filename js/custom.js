// HTML REFERENCES
const themeBtn = document.getElementById("themeBtn");
const weatherTemperatureUnitBtn = document.getElementById("weatherTemperatureUnitBtn");
const hourFormatBtn = document.getElementById("hourFormatBtn");
const weatherWindUnitBtn = document.getElementById("weatherWindUnitBtn");
const loadingContainer = document.getElementById("loadingContainer");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const locationBtn = document.getElementById("locationBtn");
const failedSearchContainer = document.getElementById("failedSearchContainer");
const failedSearchAlert = document.getElementById("failedSearchAlert");
const searchResultsContainer = document.getElementById("searchResultsContainer");
const searchResults = document.getElementById("searchResults");
const resultDataContainer = document.getElementById("resultDataContainer");
const cityCountryAdminName = document.getElementById("cityCountryAdminName");
const timezoneTime = document.getElementById("timezoneTime");
const timezoneDate = document.getElementById("timezoneDate");
const timezoneValueName = document.getElementById("timezoneValueName");
const weatherIcon = document.getElementById("weatherIcon");
const weatherType = document.getElementById("weatherType");
const weatherTemperatureValue = document.getElementById("weatherTemperatureValue");
const weatherTemperatureUnit = document.getElementById("weatherTemperatureUnit");
const weatherWindValue = document.getElementById("weatherWindValue");
const weatherWindUnit = document.getElementById("weatherWindUnit");


// ===============================================================================================
// CONSTANTS
const fallbackLocation = {
    latitude: 52.5200,
    longitude: 13.4050,
    name: "Berlin"
};


// ===============================================================================================
// VARIABLES
let currentTheme = getInitialTheme();
let currentWeatherTemperatureUnit = getInitialWeatherTemperatureUnit();
let is24HourFormat = getInitialHourFormat();
let currentWeatherWindUnit = getInitialWeatherWindUnit();
let currentFullData = null;
let cityTimeInterval = null;
let currentTimezone = null;

// ===============================================================================================
// FUNCTIONS
function getOSPreferredTheme() {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? { theme: "dark", themeIcon: "☀️" }
        : { theme: "light", themeIcon: "🌙" };
}

function getInitialTheme() {
    const storedTheme = localStorage.getItem("theme");
    const storedIcon = localStorage.getItem("themeIcon");

    if (storedTheme && storedIcon) {
        return { theme: storedTheme, themeIcon: storedIcon };
    }

    return getOSPreferredTheme();
}

function applyTheme({theme, themeIcon}) {
    document.documentElement.setAttribute("data-bs-theme", theme);
    themeBtn.textContent = themeIcon;

    localStorage.setItem("theme", theme);
    localStorage.setItem("themeIcon", themeIcon);
}

function convertTemperatureIfNeeded(temperature){
    const currentWeatherTemperatureUnit = weatherTemperatureUnit.textContent;

    // API gives Celsius → convert to Fahrenheit if needed
    if (currentWeatherTemperatureUnit === "°F") {
        return (temperature * 9/5 + 32).toFixed(1);
    }

    // User wants Celsius → use raw value
    return temperature.toFixed(1);
}

function getInitialWeatherTemperatureUnit(){
    const storedWeatherTemperatureUnit = localStorage.getItem("weatherTemperatureUnit");
    const storedWeatherTemperatureUnitBtn = localStorage.getItem("weatherTemperatureUnitBtn");

    if (storedWeatherTemperatureUnit && storedWeatherTemperatureUnitBtn) {
        return { 
            temperatureUnit: storedWeatherTemperatureUnit, 
            temperatureUnitBtn: storedWeatherTemperatureUnitBtn
        };
    }

    return { 
        temperatureUnit: "°C", 
        temperatureUnitBtn: "🌡️ °F"
    };
}

function applyWeatherTemperatureUnit({temperatureUnit, temperatureUnitBtn}){
    weatherTemperatureUnit.textContent = temperatureUnit;
    weatherTemperatureUnitBtn.textContent = temperatureUnitBtn;

    localStorage.setItem("weatherTemperatureUnit", temperatureUnit);
    localStorage.setItem("weatherTemperatureUnitBtn", temperatureUnitBtn);
}

function getRealLocalDate(timezone) {
    const now = new Date();

    const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: timezone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    }).formatToParts(now);

    const year  = parts.find(p => p.type === "year").value;
    const month = parts.find(p => p.type === "month").value;
    const day   = parts.find(p => p.type === "day").value;

    return `${year}-${month}-${day}`;
}

function startCityClock(timezone) {
    currentTimezone = timezone;

    if (!cityTimeInterval) {
        cityTimeInterval = setInterval(() => {
            if (currentTimezone) {
                timezoneTime.textContent = getRealLocalTime(currentTimezone, is24HourFormat);
            }
        }, 1000);
    }

    // Immediately update the displayed time
    timezoneTime.textContent = getRealLocalTime(currentTimezone, is24HourFormat);
}

function getInitialHourFormat() {
    const storedHourFormat = localStorage.getItem("hourFormatIs24h");
    if (storedHourFormat === "true") return true;
    if (storedHourFormat === "false") return false;
    return true; // default: 24h format
}

function applyHourFormat(is24h) {
    localStorage.setItem("hourFormatIs24h", is24HourFormat ? "true" : "false");
    hourFormatBtn.textContent = is24h ? "⏲️ 12h" : "⏲️ 24h";

    if (currentTimezone) {
        timezoneTime.textContent = getRealLocalTime(currentTimezone, is24h);
    }
}

function convertWindIfNeeded(wind){
    const currentWeatherWindUnit = weatherWindUnit.textContent;

    // API gives kilometers per hour → convert to miles per hour if needed
    if (currentWeatherWindUnit === "km/h") {
        return (wind * 0.621371).toFixed(1);
    }

    // User wants kilometers per hour → use raw value
    return wind.toFixed(1);
}

function getInitialWeatherWindUnit(){
    const storedWeatherWindUnit = localStorage.getItem("weatherWindUnit");
    const storedWeatherWindUnitBtn = localStorage.getItem("weatherWindUnitBtn");

    if (storedWeatherWindUnit && storedWeatherWindUnitBtn) {
        return { 
            windUnit: storedWeatherWindUnit, 
            windUnitBtn: storedWeatherWindUnitBtn
        };
    }

    return { 
        windUnit: "km/h", 
        windUnitBtn: "🍃 mph"
    };
}

function applyWeatherWindUnit({windUnit, windUnitBtn}){
    weatherWindUnit.textContent = windUnit;
    weatherWindUnitBtn.textContent = windUnitBtn;

    localStorage.setItem("weatherWindUnit", windUnit);
    localStorage.setItem("weatherWindUnitBtn", windUnitBtn);
}

function showLoading() {
    loadingContainer.classList.remove("d-none");
}

function hideLoading() {
    loadingContainer.classList.add("d-none");
}

async function getGeolocationData (cityName) {
    const geocodingApiUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${cityName}`;
    let geolocationData = null;
    
    try {
        const response = await fetch(geocodingApiUrl);

        if (!response.ok) {
            failedSearchAlert.textContent = `Failed to fetch geolocation data. Status: ${response.status}`;
            failedSearchContainer.classList.remove("d-none");
            hideLoading();
        }
        
        geolocationData = await response.json();
    } 
    catch (error) {
        failedSearchAlert.textContent = `An error occurred during the geolocation data API call: ${error}`;
        failedSearchContainer.classList.remove("d-none");
        hideLoading();
    }

    if(!geolocationData?.results){
        failedSearchAlert.textContent = "City not found";
        failedSearchContainer.classList.remove("d-none");
        hideLoading();
        return;
    }
    
    return geolocationData;
}

async function getWeatherByCoords(latitude, longitude, timezone = "auto") {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&timezone=${timezone}`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Status: ${response.status}`);
        return await response.json();
    } 
    catch (error) {
        failedSearchAlert.textContent = `Failed to fetch weather data: ${error}`;
        failedSearchContainer.classList.remove("d-none");
        hideLoading();
    }
}

async function getLocationByIP() {
    try {
        const response = await fetch("https://ipapi.co/json/");
        if (!response.ok) throw new Error(`Status: ${response.status}`);
        const data = await response.json();
        return {
            latitude: data.latitude,
            longitude: data.longitude,
            city: data.city,
            country: data.country_name
        };
    } 
    catch (error) {
        failedSearchAlert.textContent = `Failed to get location by IP: ${error}`;
        failedSearchContainer.classList.remove("d-none");
        hideLoading();
    }
}


function getRealLocalTime(timezone, use24Hour = true) {
    const now = new Date();
    return new Intl.DateTimeFormat("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: !use24Hour,
        timeZone: timezone
    }).format(now);
}


async function getTimezoneAndWeatherData(cityName) {
    const geolocationData = await getGeolocationData(cityName); // Latitude, longitude and timezone are neccesary

    if(!geolocationData?.results){
        failedSearchAlert.textContent = "City not found";
        failedSearchContainer.classList.remove("d-none");
        hideLoading();
        return;
    }

    let openMeteoApiUrl = "https://api.open-meteo.com/v1/forecast?";

    geolocationData.results.forEach(city => {
        openMeteoApiUrl += `&latitude=${city.latitude}`;
        openMeteoApiUrl += `&longitude=${city.longitude}`;
        openMeteoApiUrl += `&timezone=${city.timezone}`;
        openMeteoApiUrl += `&current_weather=true`;
    });

    let timezoneAndWeatherData = null;

    try {
        const response = await fetch(openMeteoApiUrl);

        if (!response.ok) {
            failedSearchAlert.textContent = `Failed to fetch timezone and weather data. Status: ${response.status}`;
            failedSearchContainer.classList.remove("d-none");
            hideLoading();
        }
        
        timezoneAndWeatherData = await response.json();
        
    } 
    catch (error) {
        failedSearchAlert.textContent = `An error occurred during the timezone-weather API call: ${error}`;
        failedSearchContainer.classList.remove("d-none");
        hideLoading();
    }

    return timezoneAndWeatherData;
}

function getWeatherIcon(code) {
    const weatherCodeMap = {
        0: "☀️", 1: "🌤️", 2: "⛅", 3: "☁️", 45: "🌫️", 48: "🌫️❄️",
        51: "🌦️", 53: "🌦️", 55: "🌧️", 56: "🌧️❄️", 57: "🌧️❄️",
        61: "🌦️", 63: "🌧️", 65: "🌧️🌧️", 66: "🌧️❄️", 67: "🌧️❄️❄️",
        71: "🌨️", 73: "❄️", 75: "❄️❄️", 77: "🌨️", 80: "🌦️",
        81: "🌧️", 82: "🌧️🌧️", 85: "🌨️", 86: "❄️❄️", 95: "⛈️",
        96: "⛈️🧊", 99: "⛈️🧊🧊"
    };

    return weatherCodeMap[code] || "❓";
}

function getWeatherType(code) {
    const weatherCodeMap = {
        0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
        45: "Fog", 48: "Depositing rime fog", 51: "Light drizzle", 53: "Moderate drizzle",
        55: "Dense drizzle", 56: "Light freezing drizzle", 57: "Dense freezing drizzle",
        61: "Slight rain", 63: "Moderate rain", 65: "Heavy rain", 66: "Light freezing rain",
        67: "Heavy freezing rain", 71: "Slight snowfall", 73: "Moderate snowfall", 75: "Heavy snowfall",
        77: "Snow grains", 80: "Slight rain showers", 81: "Moderate rain showers", 82: "Violent rain showers",
        85: "Slight snow showers", 86: "Heavy snow showers", 95: "Thunderstorm", 96: "Thunderstorm with slight hail",
        99: "Thunderstorm with heavy hail"
    };
    
    return weatherCodeMap[code] || "Unknown";
}


async function getFullData(cityName) {
    const geolocationData = await getGeolocationData(cityName);

    if (!geolocationData?.results) {
        failedSearchAlert.textContent = "City not found";
        failedSearchContainer.classList.remove("d-none");
        hideLoading();
        return;
    }

    const timezoneAndWeatherData = await getTimezoneAndWeatherData(cityName);

    let fullData = null;

    // Helper to sanitize "admin1"
    const sanitizeAdmin = (admin) => admin ? admin : "";

    if (!Array.isArray(timezoneAndWeatherData)) {
        const city = geolocationData.results[0];

        fullData = {
            cityName: city.name,
            countryName: city.country,
            adminName: sanitizeAdmin(city.admin1),
            // timezoneTime: getRealLocalTime(timezoneAndWeatherData.timezone),
            // timezoneDate: getRealLocalDate(timezoneAndWeatherData.timezone),
            timezoneValue: timezoneAndWeatherData.timezone_abbreviation,
            timezoneName: timezoneAndWeatherData.timezone,
            weatherIcon: getWeatherIcon(timezoneAndWeatherData.current_weather.weathercode),
            weatherType: getWeatherType(timezoneAndWeatherData.current_weather.weathercode),
            weatherTemperatureValue: timezoneAndWeatherData.current_weather?.temperature ?? "--",
            weatherWindValue: timezoneAndWeatherData.current_weather?.windspeed ?? "--"
        };
    } 
    else {
        fullData = geolocationData.results.map((city, i) => ({
            cityName: city.name,
            countryName: city.country,
            adminName: sanitizeAdmin(city.admin1),
            // timezoneTime: getRealLocalTime(timezoneAndWeatherData[i].timezone),
            // timezoneDate: getRealLocalDate(timezoneAndWeatherData[i].timezone),
            timezoneValue: timezoneAndWeatherData[i].timezone_abbreviation,
            timezoneName: timezoneAndWeatherData[i].timezone,
            weatherIcon: getWeatherIcon(timezoneAndWeatherData[i].current_weather.weathercode),
            weatherType: getWeatherType(timezoneAndWeatherData[i].current_weather.weathercode),
            weatherTemperatureValue: timezoneAndWeatherData[i].current_weather?.temperature ?? "--",
            weatherWindValue: timezoneAndWeatherData[i].current_weather?.windspeed ?? "--"
        }));
    }

    return fullData;
}


async function resetFullData(){
    failedSearchAlert.textContent = "Failed search text";
    failedSearchContainer.classList.add("d-none");

    searchResults.innerHTML = "";
    searchResultsContainer.classList.add("d-none");

    cityCountryAdminName.textContent = "City, country and admin name";
    timezoneTime.textContent = "Timezone time";
    timezoneDate.textContent = "Timezone date";
    timezoneValueName.textContent = "Timezone value and name";
    weatherIcon.textContent = "Weather icon";
    weatherType.textContent = "Weather type";
    weatherTemperatureValue.textContent = "Weather temperature value";
    weatherWindValue.textContent = "Weather wind value";
    resultDataContainer.classList.add("d-none");
}

function normalizeSearchQuery(cityName) {
    const processedInput = cityName.trim().toLowerCase();

    if (!processedInput) {
        failedSearchAlert.textContent = "Empty search";
        failedSearchContainer.classList.remove("d-none");
        hideLoading();
        return;
    }

    // Regex: Only allows letters (a-z), spaces (\s), hyphens (-), and apostrophes (")
    const cityRegex = /^[a-z\s-"]+$/;
    const isValid = cityRegex.test(processedInput);

    if (!isValid) {
        failedSearchAlert.textContent = "City name contains invalid characters";
        failedSearchContainer.classList.remove("d-none");
        hideLoading();
        return;
    }


    return processedInput;
}

async function setFullData(cityName, locationOverride = null) {
    if (!failedSearchContainer.classList.contains("d-none")) {
        return;
    }

    let fullData;

    // -----------------------------
    // CASE A: "USE MY LOCATION" MODE
    // -----------------------------
    if (locationOverride) {
        const { latitude, longitude, cityName, countryName, adminName } = locationOverride;

        // Fetch weather/time for exact coordinates
        const weatherData = await getWeatherByCoords(latitude, longitude);

        if (!weatherData) {
            failedSearchAlert.textContent = "Failed to load weather";
            failedSearchContainer.classList.remove("d-none");
            hideLoading();
            return;
        }

        fullData = {
            cityName,
            countryName,
            adminName: adminName || "N/A",
            timezoneValue: weatherData.timezone_abbreviation,
            timezoneName: weatherData.timezone,
            weatherIcon: getWeatherIcon(weatherData.current_weather.weathercode),
            weatherType: getWeatherType(weatherData.current_weather.weathercode),
            weatherTemperatureValue: weatherData.current_weather.temperature,
            weatherWindValue: weatherData.current_weather.windspeed
        };

        currentFullData = fullData;

        // Update UI with single result
        cityCountryAdminName.textContent =`${fullData.cityName}, ${fullData.countryName} (${fullData.adminName})`;

        timezoneTime.textContent =getRealLocalTime(fullData.timezoneName, is24HourFormat);

        timezoneDate.textContent =getRealLocalDate(fullData.timezoneName);

        timezoneValueName.textContent =`${fullData.timezoneValue} - ${fullData.timezoneName}`;

        weatherIcon.textContent = fullData.weatherIcon;
        weatherType.textContent = fullData.weatherType;
        weatherTemperatureValue.textContent = convertTemperatureIfNeeded(fullData.weatherTemperatureValue);
        weatherWindValue.textContent = fullData.weatherWindValue;

        startCityClock(fullData.timezoneName);

        resultDataContainer.classList.remove("d-none");
        return;
    }

    // -----------------------------
    // CASE B: NORMAL MANUAL SEARCH
    // -----------------------------
    const geolocationData = await getGeolocationData(cityName);

    if (!geolocationData?.results) {
        failedSearchAlert.textContent = "City not found";
        failedSearchContainer.classList.remove("d-none");
        hideLoading();
        return;
    }

    const timezoneAndWeatherData = await getTimezoneAndWeatherData(cityName);

    if (!timezoneAndWeatherData) {
        failedSearchAlert.textContent = "Weather not found";
        failedSearchContainer.classList.remove("d-none");
        hideLoading();
        return;
    }

    if (!Array.isArray(timezoneAndWeatherData)) {
        const city = geolocationData.results[0];

        fullData = {
            cityName: city.name,
            countryName: city.country,
            adminName: city.admin1,
            timezoneValue: timezoneAndWeatherData.timezone_abbreviation,
            timezoneName: timezoneAndWeatherData.timezone,
            weatherIcon: getWeatherIcon(timezoneAndWeatherData.current_weather.weathercode),
            weatherType: getWeatherType(timezoneAndWeatherData.current_weather.weathercode),
            weatherTemperatureValue: timezoneAndWeatherData.current_weather.temperature,
            weatherWindValue: timezoneAndWeatherData.current_weather.windspeed
        };

        currentFullData = fullData;

        // Update UI
        cityCountryAdminName.textContent =
            `${fullData.cityName}, ${fullData.countryName} (${fullData.adminName})`;
        timezoneTime.textContent = getRealLocalTime(fullData.timezoneName, is24HourFormat);
        timezoneDate.textContent = getRealLocalDate(fullData.timezoneName);
        timezoneValueName.textContent = `${fullData.timezoneValue} - ${fullData.timezoneName}`;
        weatherIcon.textContent = fullData.weatherIcon;
        weatherType.textContent = fullData.weatherType;
        weatherTemperatureValue.textContent = convertTemperatureIfNeeded(fullData.weatherTemperatureValue);
        weatherWindValue.textContent = fullData.weatherWindValue;

        resultDataContainer.classList.remove("d-none");

        startCityClock(fullData.timezoneName);
    } 
    else {
        // MULTIPLE RESULTS → LIST THEM
        currentFullData = geolocationData.results.map((city, i) => ({
            cityName: city.name,
            countryName: city.country,
            adminName: city.admin1,
            timezoneValue: timezoneAndWeatherData[i].timezone_abbreviation,
            timezoneName: timezoneAndWeatherData[i].timezone,
            weatherIcon: getWeatherIcon(timezoneAndWeatherData[i].current_weather.weathercode),
            weatherType: getWeatherType(timezoneAndWeatherData[i].current_weather.weathercode),
            weatherTemperatureValue: timezoneAndWeatherData[i].current_weather.temperature,
            weatherWindValue: timezoneAndWeatherData[i].current_weather.windspeed
        }));

        // Display selectable results
        searchResults.innerHTML = "";
        currentFullData.forEach(city => {
            const item = document.createElement("li");
            item.classList.add("list-group-item", "list-group-item-action");
            item.textContent = `${city.cityName}, ${city.countryName} (${city.adminName})`;
            searchResults.appendChild(item);
        });

        searchResultsContainer.classList.remove("d-none");
    }
}



// ===============================================================================================
// EVENTS
// --> Switch between light theme and dark theme
themeBtn.addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute("data-bs-theme");
    
    const newTheme = currentTheme === "dark"
        ? { theme: "light", themeIcon: "🌙" }
        : { theme: "dark", themeIcon: "☀️" };

    applyTheme(newTheme);
});

// --> Switch between Celsius and Fahrenheit
weatherTemperatureUnitBtn.addEventListener("click", () => {
    const currentWeatherTemperature = Number(weatherTemperatureValue.textContent);
    const currentWeatherTemperatureUnit = weatherTemperatureUnit.textContent;

    let newWeatherTemperature = null;
    let newWeatherTemperatureUnit = null;
    let newWeatherTemperatureUnitBtn = null;

    if(currentWeatherTemperatureUnit === "°C"){
        // Convert C → F
        newWeatherTemperature = (currentWeatherTemperature * 9/5 + 32).toFixed(1);
        newWeatherTemperatureUnit = "°F";
        newWeatherTemperatureUnitBtn = "🌡️ °C";
    }
    else {
        // Convert F → C
        newWeatherTemperature = ((currentWeatherTemperature - 32) * 5/9).toFixed(1);
        newWeatherTemperatureUnit = "°C";
        newWeatherTemperatureUnitBtn = "🌡️ °F";
    }

    weatherTemperatureValue.textContent = newWeatherTemperature;
    const newWeatherTemperatureData = {
        temperatureUnit: newWeatherTemperatureUnit,
        temperatureUnitBtn: newWeatherTemperatureUnitBtn
    }

    applyWeatherTemperatureUnit(newWeatherTemperatureData);
});

// --> Switch between 12h format and 24h format
hourFormatBtn.addEventListener("click", () => {
    is24HourFormat = !is24HourFormat;
    applyHourFormat(is24HourFormat);
});

// --> Switch between km/h and mph (wind speed)
weatherWindUnitBtn.addEventListener("click", () => {
    const currentWeatherWind = Number(weatherWindValue.textContent);
    const currentWeatherWindUnit = weatherWindUnit.textContent;

    let newWeatherWind = null;
    let newWeatherWindUnit = null;
    let newWeatherWindUnitBtn = null;

    if(currentWeatherWindUnit === "km/h"){
        // Convert km/h → mph
        newWeatherWind = (currentWeatherWind * 0.621371).toFixed(1);
        newWeatherWindUnit = "mph";
        newWeatherWindUnitBtn = "🍃 km/h";
    }
    else {
        // Convert mph → km/h
        newWeatherWind = (currentWeatherWind * 1.60934).toFixed(1);
        newWeatherWindUnit = "km/h";
        newWeatherWindUnitBtn = "🍃 mph";
    }

    weatherWindValue.textContent = newWeatherWind;
    const newWeatherWindData = {
        windUnit: newWeatherWindUnit,
        windUnitBtn: newWeatherWindUnitBtn
    }

    applyWeatherWindUnit(newWeatherWindData);
});

// --> Search for a city
searchBtn.addEventListener("click", async () => {
    showLoading();
    await resetFullData();

    const normalized = normalizeSearchQuery(searchInput.value);
    if (!normalized) {
        failedSearchAlert.textContent = "Failed to start searching";
        failedSearchContainer.classList.remove("d-none");
        hideLoading();
        return;
    }

    await setFullData(normalized);
    hideLoading();
});


// --> Search for the current location
locationBtn.addEventListener("click", async () => {
    showLoading();
    await resetFullData();

    let latitude = null;
    let longitude = null;
    let cityName = null;
    let adminName = null;
    let countryName = null;

    // Geolocalization
    try {
        const pos = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
                resolve,
                reject,
                { enableHighAccuracy: true, timeout: 5000 }
            );
        });

        latitude = pos.coords.latitude;
        longitude = pos.coords.longitude;

        // Get closest city from coords
        const geoUrl = `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${latitude}&longitude=${longitude}`;
        const geoData = await (await fetch(geoUrl)).json();

        if (geoData?.results?.length) {
            const c = geoData.results[0];
            cityName    = c.name;
            adminName   = c.admin1;
            countryName = c.country;
        }

    } catch (e) {
        console.warn("Geolocation failed.");
    }


    // IP fallback
    if (!cityName) {
        try {
            const ipData = await (await fetch("https://ipapi.co/json/")).json();
            latitude    = ipData.latitude;
            longitude   = ipData.longitude;
            cityName    = ipData.city;
            adminName   = ipData.region;
            countryName = ipData.country_name;
        } 
        catch (e) {
            console.warn("IP fallback failed.");
        }
    }

    // Predetermined city fallback
    if (!cityName) {
        cityName = "Berlin";
    }

    // Load weather/time normally
    await setFullData(cityName, {
        latitude,
        longitude,
        cityName,
        countryName,
        adminName
    });

    // If we have admin/country from IP fallback, fix it
    if (currentFullData && !Array.isArray(currentFullData)) {
        if (adminName)   currentFullData.adminName   = adminName;
        if (countryName) currentFullData.countryName = countryName;

        cityCountryAdminName.textContent = `${currentFullData.cityName}, ${currentFullData.countryName}${currentFullData.adminName ? " (" + currentFullData.adminName + ")" : ""}`;
    }

    hideLoading();
});



// --> Manage desired search result
searchResults.addEventListener("click", (event) => {
    if (event.target === searchResults) return;

    const match = event.target.textContent.match(/^(.*?), (.*?) \((.*?)\)$/);
    if (!match) return;

    const [, clickedCity, clickedCountry, clickedAdmin] = match;

    const desiredResult = currentFullData?.find(
        city => city.cityName === clickedCity
        && city.countryName === clickedCountry
        && city.adminName === clickedAdmin
    );

    if (!desiredResult) return;

    cityCountryAdminName.textContent = `${desiredResult.cityName}, ${desiredResult.countryName} (${desiredResult.adminName})`;
    timezoneTime.textContent = getRealLocalTime(desiredResult.timezoneName, is24HourFormat);
    timezoneDate.textContent = getRealLocalDate(desiredResult.timezoneName);
    timezoneValueName.textContent =`${desiredResult.timezoneValue} - ${desiredResult.timezoneName}`;
    weatherIcon.textContent = desiredResult.weatherIcon;
    weatherType.textContent = desiredResult.weatherType;
    weatherTemperatureValue.textContent = convertTemperatureIfNeeded(desiredResult.weatherTemperatureValue);
    weatherWindValue.textContent = desiredResult.weatherWindValue;

    startCityClock(desiredResult.timezoneName);

    searchResults.innerHTML = "";
    searchResultsContainer.classList.add("d-none");
    resultDataContainer.classList.remove("d-none");
});


// ===============================================================================================
// INITIAL STATE
applyTheme(currentTheme);
applyWeatherTemperatureUnit(currentWeatherTemperatureUnit);
applyHourFormat(is24HourFormat);
applyWeatherWindUnit(currentWeatherWindUnit);
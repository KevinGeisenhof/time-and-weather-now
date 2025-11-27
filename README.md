# Time & Weather Now

A responsive, client-side weather application built with **HTML**, **Bootstrap**, and **JavaScript**.
It allows users to search for a location, get current weather data, view local time/date, and switch between multiple display options such as temperature units, wind units, themes, and 12/24-hour formats.

---

## 🚀 Features

### 🌦 Weather & Location

* Search for any city or place using a search bar.
* Fetch and display:

  * Temperature
  * Wind speed
  * Timezone information
  * Local time & date
  * Additional weather metadata

### 🔧 Display Options

* **Light/Dark theme toggle**
* **Celsius ↔ Fahrenheit** temperature unit toggle
* **km/h ↔ mph** wind speed toggle
* **12h ↔ 24h** clock format toggle

### 📍 Location Tools

* “Use my location” button
* Graceful fallback UI if location retrieval or search fails

---

## 📁 Project Structure

```
├── index.html               # Main application interface
├── README.md                # (This file)
│
├── css/
│   ├── custom.css           # App-specific styles
│   └── bootstrap/           # Bootstrap source files
│
└── js/
    ├── custom.js            # Core application logic
    └── bootstrap/           # Bootstrap JS files
```

---

## 🛠 Technology Stack

* **HTML5**
* **Bootstrap 5** (CSS + JS)
* **Vanilla JavaScript**
* **Weather and geolocation APIs from Open-Meteo API** (based on usage inside `custom.js`)

---

## ▶️ Getting Started

### 1. Clone or Download

```bash
git clone <your-repo-url>
cd time-and-weather-now
```

### 2. Open the App

Simply open:

```
index.html
```

in any modern browser — no build tools required.

---

## 💡 Customization

Modify the following files to customize behavior or styling:

* **`css/custom.css`** – Add theme tweaks or layout changes
* **`js/custom.js`** – Weather logic, API calls, unit toggles, and UI interactions
* **`index.html`** – UI structure and components

---

## 🙌 Credits

* [Bootstrap](https://getbootstrap.com/)
* [Open-Meteo API](https://open-meteo.com/)

---

## 📄 License

This app uses the MIT License: [MIT License](https://mit-license.org/)

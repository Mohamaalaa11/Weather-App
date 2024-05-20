import { useState } from "react";
import "./App.css";

function getWeatherIcon(wmoCode) {
  const icons = new Map([
    [[0], "☀️"],
    [[1], "🌤"],
    [[2], "⛅️"],
    [[3], "☁️"],
    [[45, 48], "🌫"],
    [[51, 56, 61, 66, 80], "🌦"],
    [[53, 55, 63, 65, 57, 67, 81, 82], "🌧"],
    [[71, 73, 75, 77, 85, 86], "🌨"],
    [[95], "🌩"],
    [[96, 99], "⛈"],
  ]);
  const arr = [...icons.keys()].find((key) => key.includes(wmoCode));
  if (!arr) return "NOT FOUND";
  return icons.get(arr);
}

function convertToFlag(countryCode) {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
}

function formatDay(dateStr) {
  return new Intl.DateTimeFormat("en", {
    weekday: "short",
  }).format(new Date(dateStr));
}

function App() {
  return (
    <div className="app">
      <h1>Classy Weather</h1>
      <Search />
    </div>
  );
}

function Search() {
  const [isLoading, setIsLoading] = useState(false);
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);

  async function fetchWeather() {
    setIsLoading(true);
    setWeather(null);
    setLocation(null);
    setError(null);

    try {
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${city}`
      );
      const geoData = await geoRes.json();

      if (!geoData.results) throw new Error("Location not found");

      const { latitude, longitude, timezone, name, country_code } =
        geoData.results[0];
      setLocation({ name, country_code });

      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&timezone=${timezone}&daily=weathercode,temperature_2m_max,temperature_2m_min`
      );
      const weatherData = await weatherRes.json();
      setWeather(weatherData.daily);
    } catch (err) {
      console.error(err);
      setError("Error fetching data");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="form">
      <input
        type="text"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        placeholder="Search for a location"
      />
      <button onClick={fetchWeather}>Get Weather</button>
      {isLoading && <p className="loader">Loading . . .</p>}
      {error && <p className="error">{error}</p>}
      {weather && location && <Weather weather={weather} location={location} />}
    </div>
  );
}

function Weather({ weather, location }) {
  return (
    <div>
      <h2>
        Weather for {location.name} {convertToFlag(location.country_code)}
      </h2>
      <ul className="weather">
        {weather.time.map((date, index) => (
          <Day
            date={date}
            min={weather.temperature_2m_min[index]}
            max={weather.temperature_2m_max[index]}
            code={weather.weathercode[index]}
          />
        ))}
      </ul>
    </div>
  );
}
function Day({ date, min, max, code }) {
  return (
    <li className="day">
      <span>{getWeatherIcon(code)}</span>
      <p>{formatDay(date)}</p>
      <p>
        {Math.floor(min)} &deg; &mdash; {Math.ceil(max)}&deg;
      </p>
    </li>
  );
}

export default App;

// Third-party public API: Open-Meteo (https://open-meteo.com) — free, no API key
//   Geocoding: https://geocoding-api.open-meteo.com/v1/search
//   Forecast:  https://api.open-meteo.com/v1/forecast

export async function fetchWeatherByCity(city) {
  // 1) City name -> coordinates
  const geoUrl =
    'https://geocoding-api.open-meteo.com/v1/search' +
    `?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
  const geoRes = await fetch(geoUrl);
  if (!geoRes.ok) throw new Error(`Geocoding failed (${geoRes.status})`);
  const geo = await geoRes.json();
  if (!geo.results || geo.results.length === 0) {
    throw new Error(`City "${city}" not found`);
  }
  const place = geo.results[0];

  // 2) Coordinates -> current weather
  const wxUrl =
    'https://api.open-meteo.com/v1/forecast' +
    `?latitude=${place.latitude}&longitude=${place.longitude}` +
    '&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code,is_day' +
    '&daily=temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=1';
  const wxRes = await fetch(wxUrl);
  if (!wxRes.ok) throw new Error(`Weather request failed (${wxRes.status})`);
  const wx = await wxRes.json();

  const c = wx.current;
  return {
    city: place.name,
    country: place.country || '',
    temperature: c.temperature_2m,
    feelsLike: c.apparent_temperature,
    humidity: c.relative_humidity_2m,
    windSpeed: c.wind_speed_10m,
    code: c.weather_code,
    isDay: c.is_day === 1,
    max: wx.daily.temperature_2m_max[0],
    min: wx.daily.temperature_2m_min[0],
    time: (c.time || '').replace('T', ' '),
  };
}

// WMO weather codes used by Open-Meteo -> label + Ionicons icon name
export function describeWeather(code, isDay) {
  if (code === 0) return { label: 'Clear sky', icon: isDay ? 'sunny' : 'moon' };
  if (code <= 2) return { label: 'Partly cloudy', icon: isDay ? 'partly-sunny' : 'cloudy-night' };
  if (code === 3) return { label: 'Overcast', icon: 'cloud' };
  if (code === 45 || code === 48) return { label: 'Fog', icon: 'cloud' };
  if (code >= 51 && code <= 57) return { label: 'Drizzle', icon: 'rainy' };
  if (code >= 61 && code <= 67) return { label: 'Rain', icon: 'rainy' };
  if (code >= 71 && code <= 77) return { label: 'Snow', icon: 'snow' };
  if (code >= 80 && code <= 82) return { label: 'Rain showers', icon: 'rainy' };
  if (code === 85 || code === 86) return { label: 'Snow showers', icon: 'snow' };
  if (code >= 95) return { label: 'Thunderstorm', icon: 'thunderstorm' };
  return { label: 'Unknown', icon: 'help-circle' };
}

import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { DEFAULT_CITY } from '../config';
import { describeWeather, fetchWeatherByCity } from '../api/weatherApi';
import { colors } from '../theme';

// Dashboard widget: live weather from the Open-Meteo API, with a city search
export default function WeatherCard() {
  const [city, setCity] = useState(DEFAULT_CITY);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async (name) => {
    const q = (name || '').trim();
    if (!q) return;
    setLoading(true);
    setError(null);
    try {
      setWeather(await fetchWeatherByCity(q));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(DEFAULT_CITY);
  }, [load]);

  const info = weather ? describeWeather(weather.code, weather.isDay) : null;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Ionicons name="globe-outline" size={16} color={colors.white} />
        <Text style={styles.headerText}>Live Weather · Open-Meteo API</Text>
        <Pressable onPress={() => load(city)} disabled={loading} hitSlop={10}>
          <Ionicons name="refresh" size={20} color={colors.white} />
        </Pressable>
      </View>

      <View style={styles.searchRow}>
        <Ionicons name="search" size={18} color={colors.muted} />
        <TextInput
          style={styles.searchInput}
          value={city}
          onChangeText={setCity}
          placeholder="Search a city…"
          placeholderTextColor={colors.muted}
          returnKeyType="search"
          onSubmitEditing={() => load(city)}
        />
        <Pressable onPress={() => load(city)} hitSlop={10}>
          <Ionicons name="arrow-forward-circle" size={26} color={colors.primary} />
        </Pressable>
      </View>

      <View style={styles.body}>
        {loading ? (
          <ActivityIndicator color={colors.white} />
        ) : error ? (
          <Text style={styles.error}>{error}</Text>
        ) : weather ? (
          <View style={styles.row}>
            <Ionicons name={info.icon} size={58} color={colors.white} />
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={styles.temp}>{weather.temperature.toFixed(1)}°C</Text>
              <Text style={styles.line}>
                {info.label} · {weather.city}
                {weather.country ? `, ${weather.country}` : ''}
              </Text>
              <Text style={styles.small}>
                Feels {Math.round(weather.feelsLike)}° · H {Math.round(weather.max)}° L{' '}
                {Math.round(weather.min)}° · Humidity {weather.humidity}% · Wind{' '}
                {Math.round(weather.windSpeed)} km/h
              </Text>
              <Text style={styles.small}>Updated {weather.time}</Text>
            </View>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  headerText: { flex: 1, color: colors.white, fontWeight: '600' },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 14,
    paddingHorizontal: 12,
    marginTop: 12,
    gap: 8,
  },
  searchInput: { flex: 1, paddingVertical: 10, color: colors.text, fontSize: 15 },
  body: { minHeight: 90, justifyContent: 'center', marginTop: 14 },
  row: { flexDirection: 'row', alignItems: 'center' },
  temp: { color: colors.white, fontSize: 32, fontWeight: 'bold' },
  line: { color: colors.white, fontSize: 15 },
  small: { color: colors.primaryLight, fontSize: 12, marginTop: 3 },
  error: { color: '#FFE0E0', textAlign: 'center' },
});

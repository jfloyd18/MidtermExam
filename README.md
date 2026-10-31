# Student Records App

A React Native (Expo) mobile app that does full CRUD on a custom PHP + MySQL REST API and shows live weather from a third-party public API.

**Author:** Floyd Guides
**Course:** Midterm Examination: Mobile Application, Custom REST API & External API Integration

## Third-Party API

**Open-Meteo Weather API** (free, no API key needed)

- Forecast: https://api.open-meteo.com/v1/forecast
- Geocoding (city search): https://geocoding-api.open-meteo.com/v1/search
- Docs: https://open-meteo.com/en/docs

Example request used by the app:
```
https://api.open-meteo.com/v1/forecast?latitude=7.07&longitude=125.61&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code,is_day&daily=temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=1
```

## Features

| Requirement | Where it is in the app |
| --- | --- |
| **Read (GET)** | Home screen lists all students. Tap one to open the detail screen. Pull down to refresh. |
| **Create (POST)** | The "Add Student" button opens a form with validation (required fields, student number format, letters-only names, year 1–5, valid email). The list updates after saving. |
| **Update (PUT)** | "Edit" on the detail screen opens the same form already filled in with that student's data. |
| **Delete (DELETE)** | "Delete" on the detail screen shows a confirmation dialog before removing the record. |
| **External API** | The weather card on the home screen fetches live weather from Open-Meteo. Type any city and press search, or tap refresh. |

## Tech Stack
- **Mobile:** React Native with Expo (JavaScript), `fetch` API, `@expo/vector-icons`
- **Backend:** PHP 8 (PDO, prepared statements)
- **Database:** MySQL / MariaDB (XAMPP)
- **Third-party API:** Open-Meteo

## Project Structure

```
student-records-app/
├── backend/
│   ├── database.sql              # Creates the DB, table and 5 sample records
│   └── api/
│       ├── config.php            # DB credentials, CORS, helpers
│       └── students.php          # REST endpoint (GET/POST/PUT/DELETE)
└── mobile/
    ├── App.js                    # Screen navigation
    ├── app.json                  # Expo config (allows http to local XAMPP)
    ├── package.json
    └── src/
        ├── config.js             # API base URL goes here
        ├── theme.js
        ├── api/
        │   ├── studentApi.js     # Custom API calls (CRUD)
        │   └── weatherApi.js     # Open-Meteo calls
        ├── components/
        │   ├── WeatherCard.js
        │   └── ui.js             # Header, Button, ConfirmDialog, Toast
        └── screens/
            ├── HomeScreen.js
            ├── StudentDetailScreen.js
            └── StudentFormScreen.js
```

## API Endpoints

Base: `http://<host>/student_api/api/students.php`

| Method | URL | Body | Action |
| --- | --- | --- | --- |
| GET | `students.php` | | List all students |
| GET | `students.php?id=1` | | Get one student |
| POST | `students.php` | JSON student | Create |
| PUT | `students.php?id=1` | JSON student | Update |
| DELETE | `students.php?id=1` | | Delete |

Student JSON:
```json
{
  "student_number": "2023-00101",
  "first_name": "Maria",
  "last_name": "Santos",
  "course": "BS Information Technology",
  "year_level": 3,
  "email": "maria.santos@example.com"
}
```

If your host blocks PUT/DELETE, send a POST with `"_method": "PUT"` or `"_method": "DELETE"` in the body, and set `USE_METHOD_OVERRIDE = true` in `mobile/src/config.js`.

## How to Run (VS Code)

### What you need
- [Node.js](https://nodejs.org) LTS
- [XAMPP](https://www.apachefriends.org)
- VS Code
- One of these to run the app on:
  - **Expo Go** on your phone (Play Store / App Store), or
  - **Android Studio** emulator

### 1. Backend
1. Open XAMPP and start **Apache** and **MySQL**.
2. Go to http://localhost/phpmyadmin → **SQL** tab → paste everything in `backend/database.sql` → **Go**.
3. Copy the `backend` folder into `C:\xampp\htdocs\` and rename it to `student_api`.
4. Open http://localhost/student_api/api/students.php in your browser. You should see JSON with 5 students.
5. If your MySQL has a password, update `DB_USER` / `DB_PASS` in `api/config.php`.

### 2. Mobile app
1. In VS Code, **File → Open Folder** → pick the `mobile` folder.
2. Open the terminal: **Terminal → New Terminal** (or Ctrl + `).
3. Install the packages:
   ```bash
   npm install
   ```
4. Open `src/config.js` and set `API_BASE_URL`:
   - **Android emulator:** `http://10.0.2.2/student_api/api` (the default)
   - **Phone with Expo Go:** `http://<your PC's IPv4>/student_api/api`. Run `ipconfig` in Command Prompt and use the IPv4 Address, e.g. `http://192.168.1.15/student_api/api`. Your phone and PC must be on the same Wi-Fi.
5. Start the app:
   ```bash
   npx expo start
   ```
6. Then:
   - **Phone:** scan the QR code in the terminal with Expo Go (Android) or the Camera app (iPhone).
   - **Emulator:** start your emulator in Android Studio first, then press `a` in the terminal.

### Troubleshooting
- **"Cannot reach the API"** → XAMPP isn't running, or `API_BASE_URL` is wrong. On a phone, open `http://<your IPv4>/student_api/api/students.php` in the phone's browser to test. If it doesn't load, allow Apache through Windows Firewall.
- **QR code won't connect** → run `npx expo start --tunnel` instead.
- **Weird cache errors** → run `npx expo start -c`.

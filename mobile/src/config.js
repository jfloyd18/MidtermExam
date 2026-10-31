// ------------------------------------------------------------------
// Change API_BASE_URL to wherever your PHP API is running.
//
//  - Android emulator + XAMPP on your PC:   http://10.0.2.2/student_api/api
//  - Phone with Expo Go (same Wi-Fi as PC):  http://<your PC's IPv4>/student_api/api
//        (find your IPv4 by running `ipconfig` in Command Prompt)
//  - Web browser (press "w" in Expo):        http://localhost/student_api/api
//  - Online host:                           https://yourname.duckdns.org/api
// ------------------------------------------------------------------
export const API_BASE_URL = 'http://192.168.254.102/student_api/api';

// Some free hosts block PUT/DELETE. Set to true to send them as POST
// with a "_method" field instead (the PHP API supports both).
export const USE_METHOD_OVERRIDE = false;

// Default city for the weather widget
export const DEFAULT_CITY = 'Davao City';

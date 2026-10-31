<?php
// ---------------------------------------------------------------
// Database connection + shared helpers for the Student Records API
// Edit the four values below to match your MySQL setup.
// ---------------------------------------------------------------
define('DB_HOST', 'localhost');
define('DB_NAME', 'student_records');
define('DB_USER', 'root');
define('DB_PASS', '');

// CORS + JSON headers so the mobile app (and Postman) can call the API
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

function db(): PDO
{
    static $pdo = null;
    if ($pdo === null) {
        // DB_DSN env var is only used for local testing; normal setups use MySQL below
        $dsn = getenv('DB_DSN') ?: 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4';
        try {
            $pdo = new PDO($dsn, DB_USER, DB_PASS, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            ]);
        } catch (PDOException $e) {
            respond(500, ['success' => false, 'message' => 'Database connection failed: ' . $e->getMessage()]);
        }
    }
    return $pdo;
}

function respond(int $code, array $payload): void
{
    http_response_code($code);
    echo json_encode($payload);
    exit;
}

function json_body(): array
{
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);
    if (is_array($data)) {
        return $data;
    }
    // Fallback for form-encoded POSTs
    return $_POST;
}

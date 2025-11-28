

<?php
// Database configuration - update if your credentials differ
$host = '127.0.0.1';
$user = 'root';
$pass = '';
$db   = 'attendance_app';

// 1) Create mysqli connection (used by existing files that use $conn)
$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error) {
    // Fail fast for mysqli errors (useful during development)
    error_log('MySQLi connection failed: ' . $conn->connect_error);
    die('Database connection failed.');
}
$conn->set_charset('utf8mb4');

// 2) Also create a PDO connection (some APIs expect $pdo)
try {
    $pdo = new PDO(
        "mysql:host={$host};dbname={$db};charset=utf8mb4",
        $user,
        $pass,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]
    );
} catch (PDOException $e) {
    // If PDO fails, log it but keep mysqli available
    error_log('PDO connection failed: ' . $e->getMessage());
    $pdo = null;
}
?>



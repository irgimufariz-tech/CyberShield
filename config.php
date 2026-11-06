<?php
// Sesuaikan konfigurasi database dengan server lokal (XAMPP/Laragon).
$host = 'localhost';
$db   = 'cybershield';
$user = 'root';
$pass = '';
$charset = 'utf8mb4';
$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
  PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
  PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
];
try { $pdo = new PDO($dsn, $user, $pass, $options); }
catch (PDOException $e) {
  http_response_code(500);
  header('Content-Type: application/json');
  echo json_encode(['error' => 'Koneksi database gagal. Periksa config.php dan database.sql.']);
  exit;
}
?>
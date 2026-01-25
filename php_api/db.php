<?php
// /php_api/db.php

$host = '193.203.166.225'; // or 'localhost'
$db   = 'u448110646_ars_group';
$user = 'u448110646_ars_admin';
$pass = 'Bm6x!!Gl;4!er3#p@8Qx';
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
     $pdo = new PDO($dsn, $user, $pass, $options);
} catch (\PDOException $e) {
     throw new \PDOException($e->getMessage(), (int)$e->getCode());
}

// These headers are CRITICAL for allowing your Next.js app to talk to your PHP API
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Handle OPTIONS preflight request (for CORS)
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}
?>
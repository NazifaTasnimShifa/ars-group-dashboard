<?php
// /php_api/db.php

// --- DYNAMIC CORS FIX ---
// Add all your trusted frontend URLs here
$allowed_origins = [
    'http://localhost:3000',
    'https://ars-erp-dashboard.vercel.app',
    'https://ars-erp-dashb-git-95e908-md-latiful-khabir-khan-imrans-projects.vercel.app',
    'https://ars-erp-dashboard-dvioo5j44.vercel.app'
];

// Check if the request origin is in our allowed list
if (isset($_SERVER['HTTP_ORIGIN']) && in_array($_SERVER['HTTP_ORIGIN'], $allowed_origins)) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
} else {
    // If the origin is not in the list, the browser will block it.
    // We don't need to send an error, just not send the header.
}

header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Credentials: true");

// The browser will send an 'OPTIONS' request first to check if the API is safe.
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}
// --- END OF FIX ---


// --- Your Database Connection ---
$host = '193.203.166.225'; // or 'localhost' or your database host
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
     http_response_code(500);
     echo json_encode(['success' => false, 'message' => 'Database connection failed.']);
     exit;
}

header("Content-Type: application/json");
?>
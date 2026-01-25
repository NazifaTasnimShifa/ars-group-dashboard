<?php
// /php_api/login.php

include 'db.php'; // Includes your PDO connection and headers

$data = json_decode(file_get_contents("php://input"));

$email = $data->email ?? '';
$password = $data->password ?? ''; // This is plain text, e.g., "admin123"

if (empty($email) || empty($password)) {
    echo json_encode(['success' => false, 'message' => 'Email and password are required.']);
    exit;
}

$stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
$stmt->execute([$email]);
$user = $stmt->fetch();

// This line securely compares the plain text 'admin123' with the
// hashed string you stored in the database.
if ($user && password_verify($password, $user['password'])) {
    
    // Correct password!
    unset($user['password']); // Never send the hash back
    
    echo json_encode([
        'success' => true,
        'user' => $user
    ]);
} else {
    // Invalid credentials
    echo json_encode([
        'success' => false,
        'message' => 'Invalid email or password.'
    ]);
}
?>
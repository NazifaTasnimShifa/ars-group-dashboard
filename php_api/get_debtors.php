<?php
// /php_api/get_debtors.php

include 'db.php'; // Includes your PDO connection and CORS headers

// Get the company_id from the query string (e.g., .../get_debtors.php?company_id=ars_corp)
$company_id = $_GET['company_id'] ?? '';

if (empty($company_id)) {
    echo json_encode(['success' => false, 'message' => 'Company ID is required.']);
    exit;
}

// Prepare and execute the query to get all debtors for the specified company
$stmt = $pdo->prepare("SELECT * FROM debtors WHERE company_id = ? ORDER BY due ASC");
$stmt->execute([$company_id]);
$debtors = $stmt->fetchAll();

echo json_encode([
    'success' => true,
    'debtors' => $debtors
]);
?>
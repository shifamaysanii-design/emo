<?php
header('Content-Type: application/json');
date_default_timezone_set('Asia/Jakarta');

// Only allow POST request
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Metode request tidak diizinkan.']);
    exit;
}

// Get the raw POST data
$inputData = json_decode(file_get_contents('php://input'), true);

if (!$inputData) {
    echo json_encode(['success' => false, 'message' => 'Data tidak valid.']);
    exit;
}

$action = isset($inputData['action']) ? trim($inputData['action']) : '';
$ip = $_SERVER['REMOTE_ADDR'];
$userAgent = $_SERVER['HTTP_USER_AGENT'];
$timestamp = date('Y-m-d H:i:s');

// Prepare folder & file paths
$dirPath = __DIR__ . '/data';
$filePath = $dirPath . '/responses.json';

// Create data directory if it doesn't exist
if (!is_dir($dirPath)) {
    mkdir($dirPath, 0755, true);
}

// Read current responses
$responses = [];
if (file_exists($filePath)) {
    $fileContent = file_get_contents($filePath);
    $responses = json_decode($fileContent, true);
    if (!is_array($responses)) {
        $responses = [];
    }
}

if ($action === 'accept') {
    // Stage 1: She clicked the YES button
    $newResponse = [
        'id' => uniqid('res_'),
        'time' => $timestamp,
        'status' => 'DITERIMA! 🖤🌹',
        'message' => 'Ayyie menerima cintamu! Dia mengklik tombol MAU!',
        'ip' => $ip,
        'user_agent' => $userAgent
    ];
    $responses[] = $newResponse;
} 
elseif ($action === 'reply') {
    // Stage 2: She submitted a love letter reply
    $replyNote = isset($inputData['message']) ? htmlspecialchars(trim($inputData['message'])) : '';
    
    if (empty($replyNote)) {
        echo json_encode(['success' => false, 'message' => 'Pesan balasan kosong.']);
        exit;
    }

    $newResponse = [
        'id' => uniqid('rep_'),
        'time' => $timestamp,
        'status' => 'SURAT BALASAN 💌',
        'message' => $replyNote,
        'ip' => $ip,
        'user_agent' => $userAgent
    ];
    $responses[] = $newResponse;
} 
else {
    echo json_encode(['success' => false, 'message' => 'Aksi tidak dikenal.']);
    exit;
}

// Write back to file safely
if (file_put_contents($filePath, json_encode($responses, JSON_PRETTY_PRINT))) {
    echo json_encode(['success' => true, 'message' => 'Respon berhasil disimpan!']);
} else {
    echo json_encode(['success' => false, 'message' => 'Gagal menyimpan respon di server.']);
}

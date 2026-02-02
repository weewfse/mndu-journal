<?php
session_start();
require_once '../server/db.php';
header('Content-Type: application/json');
if (!isset($_SESSION['user']) || !isset($_SESSION['role'])) {
    http_response_code(401);
    echo json_encode(['ok' => false, 'error' => 'Not logged in']);
    exit;
}

$user_id = $_SESSION['user']['id'];
$role = $_SESSION['role'];

if ($role === 'admin') {
    // Admin: return all or recent articles
    $stmt = $db->query('SELECT id, title, type, author, school, level, desc, pdf_path, created_by, created_at FROM articles ORDER BY created_at DESC LIMIT 50');
    $articles = $stmt->fetchAll(PDO::FETCH_ASSOC);
} else if ($role === 'researcher') {
    // Researcher: only own uploads
    $stmt = $db->prepare('SELECT id, title, type, author, school, level, desc, pdf_path, created_by, created_at FROM articles WHERE created_by=? ORDER BY created_at DESC');
    $stmt->execute([$user_id]);
    $articles = $stmt->fetchAll(PDO::FETCH_ASSOC);
} else {
    http_response_code(403);
    echo json_encode(['ok' => false, 'error' => 'Not authorized']);
    exit;
}

// Return articles
echo json_encode(['ok' => true, 'articles' => $articles]);

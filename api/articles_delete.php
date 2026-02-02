<?php
session_start();
require_once '../server/db.php';
// Require login
if (!isset($_SESSION['user']) || !isset($_SESSION['role'])) {
    http_response_code(401);
    echo json_encode(['ok' => false, 'error' => 'Not logged in']);
    exit;
}

// Validate POST id
$id = isset($_POST['id']) ? intval($_POST['id']) : 0;
if ($id <= 0) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Invalid article id']);
    exit;
}

// Fetch article info
$stmt = $db->prepare('SELECT id, created_by, pdf_path FROM articles WHERE id=?');
$stmt->execute([$id]);
$article = $stmt->fetch(PDO::FETCH_ASSOC);
if (!$article) {
    http_response_code(404);
    echo json_encode(['ok' => false, 'error' => 'Article not found']);
    exit;
}

$user_id = $_SESSION['user']['id'];
$role = $_SESSION['role'];

// Authorization
if ($role !== 'admin' && !($role === 'researcher' && $article['created_by'] == $user_id)) {
    http_response_code(403);
    echo json_encode(['ok' => false, 'error' => 'Not authorized']);
    exit;
}

// Delete metrics if FK not set
try {
    $db->beginTransaction();
    // If metrics table exists and FK not set, delete metrics first
    // Uncomment if needed:
    // $db->prepare('DELETE FROM metrics WHERE article_id=?')->execute([$id]);
    // Delete article
    $db->prepare('DELETE FROM articles WHERE id=?')->execute([$id]);
    $db->commit();
} catch (Exception $e) {
    $db->rollBack();
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'DB error']);
    exit;
}

// Delete PDF file
$pdf_path = $article['pdf_path'];
if ($pdf_path && preg_match('#^uploads/pdf/[\w\-.]+\.pdf$#', $pdf_path)) {
    $abs_path = realpath(__DIR__ . '/../' . $pdf_path);
    $uploads_dir = realpath(__DIR__ . '/../uploads/pdf/');
    if ($abs_path && strpos($abs_path, $uploads_dir) === 0 && file_exists($abs_path)) {
        unlink($abs_path);
    }
}

header('Content-Type: application/json');
echo json_encode(['ok' => true]);

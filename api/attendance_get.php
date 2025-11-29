<?php
require 'db_connect.php';

header('Content-Type: application/json');

$session_id = $_GET['session_id'] ?? 0;
$group_id = $_GET['group_id'] ?? 0;

if ($session_id) {
    // Get attendance for a specific session
    $stmt = $pdo->prepare("
        SELECT a.student_id, a.status, s.session_number
        FROM attendance a
        JOIN sessions s ON a.session_id = s.session_id
        WHERE a.session_id = :sid
    ");
    $stmt->execute(['sid' => $session_id]);
} elseif ($group_id) {
    // Get all attendance for a group (across all sessions)
    $stmt = $pdo->prepare("
        SELECT a.student_id, a.status, s.session_number, s.session_id
        FROM attendance a
        JOIN sessions s ON a.session_id = s.session_id
        WHERE s.group_id = :gid
        ORDER BY s.session_number, a.student_id
    ");
    $stmt->execute(['gid' => $group_id]);
} else {
    echo json_encode([]);
    exit;
}

echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
?>





<?php
require_once __DIR__ . '/db_connect.php';

header('Content-Type: application/json');

// Support JSON or form-encoded POST
$raw = file_get_contents('php://input');
$data = json_decode($raw, true);
if (!$data) $data = $_POST;

$student_id = $data['student_id'] ?? null;
$session_id = isset($data['session_id']) ? (int)$data['session_id'] : null;
$status     = isset($data['status']) ? (int)$data['status'] : null;

// Validate parameters (status can be 0, so check !== null)
if (!$student_id || !$session_id || $status === null) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Missing parameters']);
    error_log('attendance_set.php validation failed: student_id=' . $student_id . ', session_id=' . $session_id . ', status=' . $status);
    exit;
}

try {
    // Check if record exists
    $stmt = $pdo->prepare('SELECT attendance_id FROM attendance WHERE student_id = :sid AND session_id = :sess LIMIT 1');
    $stmt->execute(['sid' => $student_id, 'sess' => $session_id]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($row) {
        // Update
        $id = $row['attendance_id'];
        $upd = $pdo->prepare('UPDATE attendance SET status = :status WHERE attendance_id = :id');
        $upd->execute(['status' => $status, 'id' => $id]);
        error_log("attendance_set.php: Updated attendance_id=$id to status=$status");
    } else {
        // Insert
        $ins = $pdo->prepare('INSERT INTO attendance (student_id, session_id, status) VALUES (:sid, :sess, :status)');
        $ins->execute(['sid' => $student_id, 'sess' => $session_id, 'status' => $status]);
        error_log("attendance_set.php: Inserted new attendance for student=$student_id, session=$session_id, status=$status");
    }

    echo json_encode(['status' => 'ok']);
} catch (Exception $e) {
    http_response_code(500);
    error_log('attendance_set.php error: ' . $e->getMessage());
    echo json_encode(['status' => 'error', 'message' => 'Server error']);
}
?>


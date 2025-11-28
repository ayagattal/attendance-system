<?php
require_once __DIR__ . '/db_connect.php';

header('Content-Type: application/json');

// Read JSON input (support both JSON and form-encoded)
$raw = file_get_contents('php://input');
$data = json_decode($raw, true);
if (!is_array($data)) $data = [];

// Merge POST data as fallback (form submissions)
if (!empty($_POST)) {
    $data = array_merge($data, $_POST);
}

$student_id = isset($data['id']) ? $data['id'] : null;
$first = isset($data['first']) && $data['first'] !== '' ? strtolower($data['first']) : null;
$last = isset($data['last']) && $data['last'] !== '' ? strtolower($data['last']) : null;

if (!$student_id || !$first || !$last) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Missing parameters']);
    exit;
}

try {
    $stmt = $pdo->prepare('SELECT student_id, first_name, last_name, group_id FROM students WHERE student_id = :sid LIMIT 1');
    $stmt->execute(['sid' => $student_id]);
    $student = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$student) {
        echo json_encode(['status' => 'error', 'message' => 'Student ID not found!']);
        exit;
    }

    if (strtolower($student['first_name']) !== $first || strtolower($student['last_name']) !== $last) {
        echo json_encode(['status' => 'error', 'message' => 'Wrong first/last name!']);
        exit;
    }

    echo json_encode([
        'status' => 'ok',
        'student' => [
            'id' => $student['student_id'],
            'first' => $student['first_name'],
            'last' => $student['last_name'],
            'group_id' => $student['group_id']
        ]
    ]);

} catch (Exception $e) {
    http_response_code(500);
    error_log('loginStudent.php error: ' . $e->getMessage());
    echo json_encode(['status' => 'error', 'message' => 'Server error']);
}
?>

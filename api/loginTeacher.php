<?php
require_once __DIR__ . '/db_connect.php';

header('Content-Type: application/json');

// If called with this :?all=1 return all teachers:
if (isset($_GET['all'])) {
    try {
        $stmt = $pdo->query('SELECT teacher_id, first_name, last_name FROM teachers');
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        exit;
    } catch (Exception $e) {
        error_log('loginTeacher.php list error: ' . $e->getMessage());
        echo json_encode([]);
        exit;
    }
}

// Accept JSON or form data
$raw = file_get_contents('php://input');
$data = json_decode($raw, true);
if (!is_array($data)) $data = [];
if (!empty($_POST)) $data = array_merge($data, $_POST);

$teacher_id = isset($data['id']) ? (int) $data['id'] : 0;
$first = isset($data['first']) && $data['first'] !== '' ? strtolower(trim($data['first'])) : null;
$last  = isset($data['last']) && $data['last'] !== '' ? strtolower(trim($data['last'])) : null;

if (!$teacher_id || !$first || !$last) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Missing parameters']);
    exit;
}

try {
    $stmt = $pdo->prepare('SELECT teacher_id, first_name, last_name FROM teachers WHERE teacher_id = :tid LIMIT 1');
    $stmt->execute(['tid' => $teacher_id]);
    $teacher = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$teacher) {
        echo json_encode(['status' => 'error', 'message' => 'Teacher ID not found!']);
        exit;
    }

    if (strtolower($teacher['first_name']) !== $first || strtolower($teacher['last_name']) !== $last) {
        echo json_encode(['status' => 'error', 'message' => 'Wrong first/last name!']);
        exit;
    }

    echo json_encode([
        'status' => 'ok',
        'teacher' => [
            'id' => $teacher['teacher_id'],
            'first' => $teacher['first_name'],
            'last' => $teacher['last_name']
        ]
    ]);
} catch (Exception $e) {
    http_response_code(500);
    error_log('loginTeacher.php error: ' . $e->getMessage());
    echo json_encode(['status' => 'error', 'message' => 'Server error']);
}
?>

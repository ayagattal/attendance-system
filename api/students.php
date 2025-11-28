<?php
require_once __DIR__ . '/db_connect.php';

header('Content-Type: application/json');

// GET: Fetch students for a group
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
	$group_id = isset($_GET['group_id']) ? (int)$_GET['group_id'] : 0;

	try {
		$stmt = $pdo->prepare('SELECT student_id, first_name, last_name, group_id FROM students WHERE group_id = :gid');
		$stmt->execute(['gid' => $group_id]);
		$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
		echo json_encode($rows ?: []);
	} catch (Exception $e) {
		error_log('students.php GET error: ' . $e->getMessage());
		echo json_encode([]);
	}
}
// POST: Add new student
elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
	$raw = file_get_contents('php://input');
	$data = json_decode($raw, true);
	if (!is_array($data)) $data = [];

	$student_id = isset($data['student_id']) ? trim($data['student_id']) : null;
	$first_name = isset($data['first_name']) ? trim($data['first_name']) : null;
	$last_name = isset($data['last_name']) ? trim($data['last_name']) : null;
	$group_id = isset($data['group_id']) ? (int)$data['group_id'] : 0;

	if (!$student_id || !$first_name || !$last_name || !$group_id) {
		http_response_code(400);
		echo json_encode(['success' => false, 'message' => 'Missing required fields']);
		exit;
	}

	try {
		// Check if student already exists
		$check = $pdo->prepare('SELECT student_id FROM students WHERE student_id = :sid LIMIT 1');
		$check->execute(['sid' => $student_id]);
		if ($check->fetch()) {
			echo json_encode(['success' => false, 'message' => 'Student ID already exists']);
			exit;
		}

		// Insert new student
		$stmt = $pdo->prepare('INSERT INTO students (student_id, first_name, last_name, group_id) VALUES (:sid, :first, :last, :gid)');
		$stmt->execute([
			':sid' => $student_id,
			':first' => $first_name,
			':last' => $last_name,
			':gid' => $group_id
		]);

		echo json_encode(['success' => true, 'message' => 'Student added successfully']);
	} catch (Exception $e) {
		http_response_code(500);
		error_log('students.php POST error: ' . $e->getMessage());
		echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
	}
} else {
	http_response_code(405);
	echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}
?>


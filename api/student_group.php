<?php
require 'db_connect.php';

header('Content-Type: application/json');

$student_id = isset($_GET['student_id']) ? $_GET['student_id'] : '';

if (!$student_id) {
    echo json_encode([]);
    exit;
}

try {
    // Get the student's group and the modules for that group
    $stmt = $pdo->prepare(
        "SELECT g.group_id, g.group_name, m.module_id, m.module_name\n         FROM students s\n         JOIN group_list g ON s.group_id = g.group_id\n         LEFT JOIN group_modules gm ON g.group_id = gm.group_id\n         LEFT JOIN modules m ON gm.module_id = m.module_id\n         WHERE s.student_id = :sid"
    );

    $stmt->execute(['sid' => $student_id]);

    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($rows ?: []);
} catch (Exception $e) {
    error_log('student_group.php error: ' . $e->getMessage());
    echo json_encode([]);
}
?>

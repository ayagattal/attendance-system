<?php
require 'db_connect.php';

$id = $_GET['id'] ?? '';

if (!$id) {
    echo json_encode(["error" => "No student ID"]);
    exit;
}

$stmt = $pdo->prepare("
    SELECT student_id, first_name, last_name 
    FROM students 
    WHERE student_id = :id
");
$stmt->execute(['id' => $id]);

$student = $stmt->fetch(PDO::FETCH_ASSOC);

echo json_encode($student ?: []);
?>

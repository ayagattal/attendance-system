<?php
require 'db_connect.php';

$session_id = $_GET['session_id'] ?? 0;

$stmt = $pdo->prepare("
    SELECT student_id, status
    FROM attendance
    WHERE session_id = :sid
");
$stmt->execute(['sid' => $session_id]);

echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
?>




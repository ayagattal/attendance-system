<?php
require 'db_connect.php';

$group_id = $_GET['group_id'] ?? 0;

$stmt = $pdo->prepare("
    SELECT session_id, session_number 
    FROM sessions
    WHERE group_id = :gid
    ORDER BY session_number
");
$stmt->execute(['gid'=>$group_id]);

echo json_encode($stmt->fetchAll());
?>

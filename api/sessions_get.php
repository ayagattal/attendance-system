<?php
require_once __DIR__ . '/db_connect.php';

header('Content-Type: application/json');

$group_id = isset($_GET['group_id']) ? (int)$_GET['group_id'] : 0;

try {
	$stmt = $pdo->prepare('SELECT session_id, group_id, session_number FROM sessions WHERE group_id = :gid ORDER BY session_number ASC');
	$stmt->execute(['gid' => $group_id]);
	$list = $stmt->fetchAll(PDO::FETCH_ASSOC);
	echo json_encode($list ?: []);
} catch (Exception $e) {
	error_log('sessions_get.php error: ' . $e->getMessage());
	echo json_encode([]);
}
?>

<?php
require 'db_connect.php';

header('Content-Type: application/json');

$module_id = isset($_GET['module_id']) ? (int)$_GET['module_id'] : 0;

try {
    if ($module_id > 0) {
        // Return groups linked to a specific module
        $stmt = $pdo->prepare(
            "SELECT gl.group_id, gl.group_name\n             FROM group_list gl\n             JOIN group_modules gm ON gl.group_id = gm.group_id\n             WHERE gm.module_id = :mid\n             ORDER BY gl.group_name"
        );
        $stmt->execute(['mid' => $module_id]);
        echo json_encode($stmt->fetchAll());
    } else {
        // No module specified — return all groups
        $stmt = $pdo->query('SELECT group_id, group_name FROM group_list ORDER BY group_name');
        echo json_encode($stmt->fetchAll());
    }
} catch (Exception $e) {
    // Return empty array on error but log it for debugging
    error_log('groups.php error: ' . $e->getMessage());
    echo json_encode([]);
}
?>

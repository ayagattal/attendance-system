<?php
require_once __DIR__ . '/db_connect.php';

header('Content-Type: application/json');

// If group_id provided, return modules linked to that group.
$group_id = isset($_GET['group_id']) ? (int)$_GET['group_id'] : 0;

try {
        if ($group_id > 0) {
                $stmt = $pdo->prepare('SELECT m.module_id, m.module_name FROM modules m JOIN group_modules gm ON m.module_id = gm.module_id WHERE gm.group_id = :gid');
                $stmt->execute(['gid' => $group_id]);
                $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode($data ?: []);
        } else {
                // No group specified — return all modules
                $stmt = $pdo->query('SELECT module_id, module_name FROM modules ORDER BY module_name');
                echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        }
} catch (Exception $e) {
        error_log('modules.php error: ' . $e->getMessage());
        echo json_encode([]);
}
?>

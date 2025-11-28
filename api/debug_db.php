<?php
require_once 'db_connect.php';

header('Content-Type: application/json');

$output = [];

// Check teachers
try {
    $stmt = $pdo->query('SELECT teacher_id, first_name, last_name FROM teachers');
    $output['teachers'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
} catch (Exception $e) {
    $output['teachers_error'] = $e->getMessage();
}

// Check teacher_teaches mapping
try {
    $stmt = $pdo->query('SELECT * FROM teacher_teaches');
    $output['teacher_teaches'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
} catch (Exception $e) {
    $output['teacher_teaches_error'] = $e->getMessage();
}

// Check groups
try {
    $stmt = $pdo->query('SELECT group_id, group_name FROM group_list');
    $output['groups'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
} catch (Exception $e) {
    $output['groups_error'] = $e->getMessage();
}

// Check group_modules
try {
    $stmt = $pdo->query('SELECT * FROM group_modules');
    $output['group_modules'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
} catch (Exception $e) {
    $output['group_modules_error'] = $e->getMessage();
}

// Check modules
try {
    $stmt = $pdo->query('SELECT module_id, module_name FROM modules');
    $output['modules'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
} catch (Exception $e) {
    $output['modules_error'] = $e->getMessage();
}

echo json_encode($output, JSON_PRETTY_PRINT);
?>

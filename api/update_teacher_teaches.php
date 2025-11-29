<?php
require 'db_connect.php';

try {
    // Clear existing data
    $pdo->exec("DELETE FROM teacher_teaches");
    
    $sql = "INSERT INTO `teacher_teaches` (`teacher_id`, `group_id`) VALUES 
    (1, 1),
    (2, 2),
    (3, 3),
    (3, 4),
    (4, 5),
    (4, 6),
    (2, 7),
    (6, 9),
    (5, 10),
    (5, 11),
    (6, 12)";
    
    $pdo->exec($sql);
    
    echo json_encode(['status' => 'success', 'message' => 'teacher_teaches table updated']);
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>

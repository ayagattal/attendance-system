<?php
require 'db_connect.php';

try {
    // for drop  attendance table
    $pdo->exec("DROP TABLE IF EXISTS attendance");
    
    // Create new attendance table with numeric status
   
    $pdo->exec("
        CREATE TABLE attendance (
            attendance_id int NOT NULL AUTO_INCREMENT,
            student_id varchar(20) NOT NULL,
            session_id int NOT NULL,
            status int NOT NULL DEFAULT 0,
            PRIMARY KEY (attendance_id),
            UNIQUE KEY unique_attendance (student_id, session_id),
            KEY student_id (student_id),
            KEY session_id (session_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
    ");
    
    echo json_encode(['status' => 'success', 'message' => 'Attendance table migrated (status: 0=absent, 1=present, 2=participated, 3=present+participated)']);
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>

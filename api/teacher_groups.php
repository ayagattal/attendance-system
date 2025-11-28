<?php
require 'db_connect.php';

header('Content-Type: application/json');

$teacher_id = isset($_GET['teacher_id']) ? (int)$_GET['teacher_id'] : 0;

try {
    $stmt = $pdo->prepare(
        "SELECT DISTINCT g.group_id, g.group_name, m.module_id, m.module_name
         FROM teacher_teaches t
         JOIN group_list g ON t.group_id = g.group_id
         LEFT JOIN group_modules gm ON g.group_id = gm.group_id
         LEFT JOIN modules m ON gm.module_id = m.module_id
         WHERE t.teacher_id = :tid
         ORDER BY g.group_name, m.module_name"
    );

    $stmt->execute(['tid' => $teacher_id]);
    $rows = $stmt->fetchAll();

    // ---- Build clean structure:
    // {
    //   "SI_G1": { group_id: 1, modules: [ {module_id, module_name}, ... ] }
    // }

    $result = [];

    foreach ($rows as $r) {
        $gid = $r["group_id"];
        $gname = $r["group_name"];

        if (!isset($result[$gid])) {
            $result[$gid] = [
                "group_id" => $gid,
                "group_name" => $gname,
                "modules" => []
            ];
        }

        if ($r["module_id"]) {
            $result[$gid]["modules"][$r["module_id"]] = [
                "module_id" => $r["module_id"],
                "module_name" => $r["module_name"]
            ];
        }
    }

    // convert "modules" assoc array → normal array
    foreach ($result as &$g) {
        $g["modules"] = array_values($g["modules"]);
    }

    echo json_encode(array_values($result));

} catch (Exception $e) {
    error_log('teacher_groups.php error: ' . $e->getMessage());
    echo json_encode([]);
}
?>


<?php
require 'db_connect.php';

try {
    // Clear all group_modules
    $pdo->exec("DELETE FROM group_modules");
    
    // Map groups to their correct modules based on group names
    $mappings = [
        // SI_G1 and SI_G2 have SI module
        ['group_id' => 1, 'module_name' => 'SI'],      // SI_G1
        ['group_id' => 2, 'module_name' => 'SI'],      // SI_G2
        
        // TDG_G1 and TDG_G2 have TDG module
        ['group_id' => 3, 'module_name' => 'TDG'],     // TDG_G1
        ['group_id' => 4, 'module_name' => 'TDG'],     // TDG_G2
        
        // LM_G1 and LM_G2 have LM module
        ['group_id' => 5, 'module_name' => 'LM'],      // LM_G1
        ['group_id' => 6, 'module_name' => 'LM'],      // LM_G2
        
        // ASD_G1 has ASD module
        ['group_id' => 7, 'module_name' => 'ASD'],     // ASD_G1
        
        // Group 8 not used (or placeholder)
        
        // PAW_G2 has PAW module
        ['group_id' => 9, 'module_name' => 'PAW'],     // PAW_G2
        
        // BDD_G1 and BDD_G2 have BDD module
        ['group_id' => 10, 'module_name' => 'BDD'],    // BDD_G1
        ['group_id' => 11, 'module_name' => 'BDD'],    // BDD_G2
        
        // SE_G1 has SE module
        ['group_id' => 12, 'module_name' => 'SE'],     // SE_G1
    ];
    
    $stmt = $pdo->prepare("SELECT module_id FROM modules WHERE module_name = ?");
    
    foreach ($mappings as $mapping) {
        $stmt->execute([$mapping['module_name']]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($result) {
            $module_id = $result['module_id'];
            $insert = $pdo->prepare("INSERT INTO group_modules (group_id, module_id) VALUES (?, ?)");
            $insert->execute([$mapping['group_id'], $module_id]);
            echo "Mapped group_id {$mapping['group_id']} to module {$mapping['module_name']} (id: $module_id)\n";
        } else {
            echo " Module not found: {$mapping['module_name']}\n";
        }
    }
    
    echo " group_modules table rebuilt successfully\n";
    
} catch (Exception $e) {
    echo "!!! Error: " . $e->getMessage();
}
?>

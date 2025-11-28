<?php
// Backwards-compat shim: some pages/tools request getStudents.php
// Forward the request to the canonical `students.php` endpoint.
require_once __DIR__ . '/students.php';

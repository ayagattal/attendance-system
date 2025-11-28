-- Database schema for attendance_app

DROP TABLE IF EXISTS attendance;
CREATE TABLE IF NOT EXISTS attendance (
  attendance_id int NOT NULL AUTO_INCREMENT,
  student_id varchar(20) NOT NULL,
  session_id int NOT NULL,
  status enum('present','absent') NOT NULL,
  PRIMARY KEY (attendance_id),
  KEY student_id (student_id),
  KEY session_id (session_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS group_list;
CREATE TABLE IF NOT EXISTS group_list (
  group_id int NOT NULL AUTO_INCREMENT,
  group_name varchar(50) NOT NULL,
  PRIMARY KEY (group_id)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- DROP TABLE IF EXISTS group_modules;
CREATE TABLE IF NOT EXISTS group_modules (
  id int NOT NULL AUTO_INCREMENT,
  group_id int NOT NULL,
  module_id int NOT NULL,
  PRIMARY KEY (id),
  KEY group_id (group_id),
  KEY module_id (module_id)
) ENGINE=InnoDB AUTO_INCREMENT=99 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS modules;
CREATE TABLE IF NOT EXISTS modules (
  module_id int NOT NULL AUTO_INCREMENT,
  module_name varchar(100) NOT NULL,
  PRIMARY KEY (module_id)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Structure de la table sessions
-- DROP TABLE IF EXISTS sessions;
CREATE TABLE IF NOT EXISTS sessions (
  session_id int NOT NULL AUTO_INCREMENT,
  group_id int NOT NULL,
  session_number int NOT NULL,
  PRIMARY KEY (session_id),
  UNIQUE KEY group_id (group_id,session_number)
) ENGINE=InnoDB AUTO_INCREMENT=73 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS students;
CREATE TABLE IF NOT EXISTS students (
  student_id varchar(20) NOT NULL,
  first_name varchar(50) NOT NULL,
  last_name varchar(50) NOT NULL,
  group_id int NOT NULL,
  PRIMARY KEY (student_id),
  KEY group_id (group_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS teachers;
CREATE TABLE IF NOT EXISTS teachers (
  teacher_id int NOT NULL AUTO_INCREMENT,
  first_name varchar(50) NOT NULL,
  last_name varchar(50) NOT NULL,
  PRIMARY KEY (teacher_id)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Additional mapping table for teacher_teaches (not in original dump but used by APIs)
CREATE TABLE IF NOT EXISTS teacher_teaches (
  id int NOT NULL AUTO_INCREMENT,
  teacher_id int NOT NULL,
  group_id int NOT NULL,
  PRIMARY KEY (id),
  KEY teacher_id (teacher_id),
  KEY group_id (group_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Optional sample data (small) --- remove or edit as needed
INSERT INTO modules (module_name) VALUES ('Algorithms'), ('Databases'), ('Web Dev');
INSERT INTO group_list (group_name) VALUES ('Group A'), ('Group B');
INSERT INTO group_modules (group_id, module_id) VALUES (1,1),(1,2),(2,3);
INSERT INTO students (student_id, first_name, last_name, group_id) VALUES
('S1001','Alice','Smith',1),
('S1002','Bob','Jones',1),
('S2001','Charlie','Brown',2);
INSERT INTO teachers (first_name, last_name) VALUES ('John','Doe');
INSERT INTO teacher_teaches (teacher_id, group_id) VALUES (1,1);

-- Create a few sessions
INSERT INTO sessions (group_id, session_number) VALUES (1,1),(1,2),(2,1);

-- Example attendance
INSERT INTO attendance (student_id, session_id, status) VALUES ('S1001',1,'present'),('S1002',1,'absent');

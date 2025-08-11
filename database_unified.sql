-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema mydb
-- -----------------------------------------------------
-- -----------------------------------------------------
-- Schema colegio_AML
-- -----------------------------------------------------
DROP SCHEMA IF EXISTS `colegio_AML` ;

-- -----------------------------------------------------
-- Schema colegio_AML
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `colegio_AML` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ;
-- -----------------------------------------------------
-- Schema colegio_aml
-- -----------------------------------------------------
DROP SCHEMA IF EXISTS `colegio_aml` ;

-- -----------------------------------------------------
-- Schema colegio_aml
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `colegio_aml` ;
USE `colegio_AML` ;

-- -----------------------------------------------------
-- Table `colegio_AML`.`comunas`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `colegio_AML`.`comunas` ;

CREATE TABLE IF NOT EXISTS `colegio_AML`.`comunas` (
  `id_comuna` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`id_comuna`))
ENGINE = InnoDB
AUTO_INCREMENT = 6
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `colegio_AML`.`cursos`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `colegio_AML`.`cursos` ;

CREATE TABLE IF NOT EXISTS `colegio_AML`.`cursos` (
  `id_curso` INT NOT NULL AUTO_INCREMENT,
  `nivel` INT NOT NULL,
  `letra` CHAR(1) NOT NULL,
  `nombre` VARCHAR(100) GENERATED ALWAYS AS (concat(`nivel`,_utf8mb4'° ',`letra`)) STORED,
  `descripcion` TEXT NULL DEFAULT NULL,
  `activo` TINYINT(1) NULL DEFAULT '1',
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_curso`))
ENGINE = InnoDB
AUTO_INCREMENT = 4
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `colegio_AML`.`alumnos`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `colegio_AML`.`alumnos` ;

CREATE TABLE IF NOT EXISTS `colegio_AML`.`alumnos` (
  `id_alumno` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(100) NOT NULL,
  `apellido_paterno` VARCHAR(100) NOT NULL,
  `apellido_materno` VARCHAR(100) NOT NULL,
  `fecha_nacimiento` DATE NULL DEFAULT NULL,
  `fecha_ingreso` DATE NULL DEFAULT NULL,
  `edad` INT NULL DEFAULT NULL,
  `direccion` VARCHAR(255) NULL DEFAULT NULL,
  `email` VARCHAR(100) NOT NULL,
  `telefono` VARCHAR(20) NULL DEFAULT NULL,
  `id_comuna_fk` INT NULL DEFAULT NULL,
  `id_curso_fk` INT NULL DEFAULT NULL,
  `activo` TINYINT(1) NULL DEFAULT '1',
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_alumno`),
  UNIQUE INDEX `email` (`email` ASC) VISIBLE,
  INDEX `id_comuna_fk` (`id_comuna_fk` ASC) VISIBLE,
  INDEX `idx_alumnos_curso` (`id_curso_fk` ASC) VISIBLE,
  INDEX `idx_alumnos_activo` (`activo` ASC) VISIBLE,
  CONSTRAINT `alumnos_ibfk_1`
    FOREIGN KEY (`id_comuna_fk`)
    REFERENCES `colegio_AML`.`comunas` (`id_comuna`),
  CONSTRAINT `alumnos_ibfk_2`
    FOREIGN KEY (`id_curso_fk`)
    REFERENCES `colegio_AML`.`cursos` (`id_curso`))
ENGINE = InnoDB
AUTO_INCREMENT = 41
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `colegio_AML`.`asignaturas`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `colegio_AML`.`asignaturas` ;

CREATE TABLE IF NOT EXISTS `colegio_AML`.`asignaturas` (
  `id_asignatura` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`id_asignatura`))
ENGINE = InnoDB
AUTO_INCREMENT = 5
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `colegio_AML`.`profesores`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `colegio_AML`.`profesores` ;

CREATE TABLE IF NOT EXISTS `colegio_AML`.`profesores` (
  `id_profesor` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(100) NOT NULL,
  `apellido` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  `especialidad` VARCHAR(100) NULL DEFAULT NULL,
  `id_asignatura_fk` INT NULL DEFAULT NULL,
  `activo` TINYINT(1) NULL DEFAULT '1',
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_profesor`),
  UNIQUE INDEX `email` (`email` ASC) VISIBLE,
  INDEX `id_asignatura_fk` (`id_asignatura_fk` ASC) VISIBLE,
  CONSTRAINT `profesores_ibfk_1`
    FOREIGN KEY (`id_asignatura_fk`)
    REFERENCES `colegio_AML`.`asignaturas` (`id_asignatura`))
ENGINE = InnoDB
AUTO_INCREMENT = 6
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `colegio_AML`.`usuarios`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `colegio_AML`.`usuarios` ;

CREATE TABLE IF NOT EXISTS `colegio_AML`.`usuarios` (
  `id_usuario` INT NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(100) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `rol` ENUM('admin', 'profesor', 'apoderado') NOT NULL,
  `id_profesor_fk` INT NULL DEFAULT NULL,
  `id_alumno_fk` INT NULL DEFAULT NULL,
  `es_apoderado` TINYINT(1) NULL DEFAULT '0',
  `activo` TINYINT(1) NULL DEFAULT '1',
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_usuario`),
  UNIQUE INDEX `email` (`email` ASC) VISIBLE,
  INDEX `id_profesor_fk` (`id_profesor_fk` ASC) VISIBLE,
  INDEX `id_alumno_fk` (`id_alumno_fk` ASC) VISIBLE,
  INDEX `idx_usuarios_rol` (`rol` ASC) VISIBLE,
  CONSTRAINT `usuarios_ibfk_1`
    FOREIGN KEY (`id_profesor_fk`)
    REFERENCES `colegio_AML`.`profesores` (`id_profesor`)
    ON DELETE SET NULL,
  CONSTRAINT `usuarios_ibfk_2`
    FOREIGN KEY (`id_alumno_fk`)
    REFERENCES `colegio_AML`.`alumnos` (`id_alumno`)
    ON DELETE SET NULL)
ENGINE = InnoDB
AUTO_INCREMENT = 46
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `colegio_AML`.`apoderados_alumnos`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `colegio_AML`.`apoderados_alumnos` ;

CREATE TABLE IF NOT EXISTS `colegio_AML`.`apoderados_alumnos` (
  `id_apoderado_fk` INT NOT NULL,
  `id_alumno_fk` INT NOT NULL,
  PRIMARY KEY (`id_apoderado_fk`, `id_alumno_fk`),
  INDEX `id_alumno_fk` (`id_alumno_fk` ASC) VISIBLE,
  CONSTRAINT `apoderados_alumnos_ibfk_1`
    FOREIGN KEY (`id_apoderado_fk`)
    REFERENCES `colegio_AML`.`usuarios` (`id_usuario`)
    ON DELETE CASCADE,
  CONSTRAINT `apoderados_alumnos_ibfk_2`
    FOREIGN KEY (`id_alumno_fk`)
    REFERENCES `colegio_AML`.`alumnos` (`id_alumno`)
    ON DELETE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `colegio_AML`.`asignaciones`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `colegio_AML`.`asignaciones` ;

CREATE TABLE IF NOT EXISTS `colegio_AML`.`asignaciones` (
  `id_asignacion` INT NOT NULL AUTO_INCREMENT,
  `id_profesor_fk` INT NOT NULL,
  `id_asignatura_fk` INT NOT NULL,
  `id_curso_fk` INT NOT NULL,
  `activo` TINYINT(1) NULL DEFAULT '1',
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_asignacion`),
  UNIQUE INDEX `unique_assignment` (`id_profesor_fk` ASC, `id_asignatura_fk` ASC, `id_curso_fk` ASC) VISIBLE,
  INDEX `id_asignatura_fk` (`id_asignatura_fk` ASC) VISIBLE,
  INDEX `id_curso_fk` (`id_curso_fk` ASC) VISIBLE,
  CONSTRAINT `asignaciones_ibfk_1`
    FOREIGN KEY (`id_profesor_fk`)
    REFERENCES `colegio_AML`.`profesores` (`id_profesor`)
    ON DELETE CASCADE,
  CONSTRAINT `asignaciones_ibfk_2`
    FOREIGN KEY (`id_asignatura_fk`)
    REFERENCES `colegio_AML`.`asignaturas` (`id_asignatura`)
    ON DELETE CASCADE,
  CONSTRAINT `asignaciones_ibfk_3`
    FOREIGN KEY (`id_curso_fk`)
    REFERENCES `colegio_AML`.`cursos` (`id_curso`)
    ON DELETE CASCADE)
ENGINE = InnoDB
AUTO_INCREMENT = 9
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `colegio_AML`.`huellas_dactilares`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `colegio_AML`.`huellas_dactilares` ;

CREATE TABLE IF NOT EXISTS `colegio_AML`.`huellas_dactilares` (
  `id_huella` INT NOT NULL AUTO_INCREMENT,
  `id_alumno` INT NOT NULL,
  `template_huella` LONGTEXT NOT NULL,
  `hash_huella` VARCHAR(64) NOT NULL,
  `calidad` DECIMAL(5,2) NULL DEFAULT '0.00',
  `dedo` ENUM('pulgar_derecho', 'indice_derecho', 'medio_derecho', 'anular_derecho', 'menique_derecho', 'pulgar_izquierdo', 'indice_izquierdo', 'medio_izquierdo', 'anular_izquierdo', 'menique_izquierdo') NULL DEFAULT 'indice_derecho',
  `activa` TINYINT(1) NULL DEFAULT '1',
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_huella`),
  INDEX `idx_hash_huella` (`hash_huella` ASC) VISIBLE,
  INDEX `idx_id_alumno_activa` (`id_alumno` ASC, `activa` ASC) VISIBLE,
  INDEX `idx_huellas_calidad` (`calidad` ASC) VISIBLE,
  CONSTRAINT `huellas_dactilares_ibfk_1`
    FOREIGN KEY (`id_alumno`)
    REFERENCES `colegio_AML`.`alumnos` (`id_alumno`)
    ON DELETE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `colegio_AML`.`asistencias`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `colegio_AML`.`asistencias` ;

CREATE TABLE IF NOT EXISTS `colegio_AML`.`asistencias` (
  `id_asistencia` INT NOT NULL AUTO_INCREMENT,
  `id_alumno` INT NOT NULL,
  `fecha` DATE NOT NULL,
  `estado` ENUM('presente', 'ausente', 'tardanza', 'justificado') NOT NULL,
  `hora_llegada` TIME NULL DEFAULT NULL,
  `observaciones` TEXT NULL DEFAULT NULL,
  `metodo_registro` ENUM('manual', 'huella_dactilar', 'tarjeta_rfid') NULL DEFAULT 'huella_dactilar',
  `id_huella_usada` INT NULL DEFAULT NULL,
  `id_profesor` INT NULL DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_asistencia`),
  UNIQUE INDEX `unique_alumno_fecha` (`id_alumno` ASC, `fecha` ASC) VISIBLE,
  INDEX `id_huella_usada` (`id_huella_usada` ASC) VISIBLE,
  INDEX `id_profesor` (`id_profesor` ASC) VISIBLE,
  INDEX `idx_asistencias_fecha` (`fecha` ASC) VISIBLE,
  INDEX `idx_asistencias_alumno` (`id_alumno` ASC) VISIBLE,
  INDEX `idx_asistencias_estado` (`estado` ASC) VISIBLE,
  INDEX `idx_asistencias_metodo` (`metodo_registro` ASC) VISIBLE,
  CONSTRAINT `asistencias_ibfk_1`
    FOREIGN KEY (`id_alumno`)
    REFERENCES `colegio_AML`.`alumnos` (`id_alumno`)
    ON DELETE CASCADE,
  CONSTRAINT `asistencias_ibfk_2`
    FOREIGN KEY (`id_huella_usada`)
    REFERENCES `colegio_AML`.`huellas_dactilares` (`id_huella`)
    ON DELETE SET NULL,
  CONSTRAINT `asistencias_ibfk_3`
    FOREIGN KEY (`id_profesor`)
    REFERENCES `colegio_AML`.`profesores` (`id_profesor`)
    ON DELETE SET NULL)
ENGINE = InnoDB
AUTO_INCREMENT = 18
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;

USE `colegio_aml` ;
USE `colegio_aml` ;

-- -----------------------------------------------------
-- Placeholder table for view `colegio_aml`.`vista_asignaciones_completa`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `colegio_aml`.`vista_asignaciones_completa` (`id_asignacion` INT, `id_profesor` INT, `id_asignatura` INT, `id_curso` INT, `activo` INT, `created_at` INT, `updated_at` INT, `profesor_nombre` INT, `profesor_apellido` INT, `profesor_completo` INT, `profesor_email` INT, `profesor_especialidad` INT, `asignatura_nombre` INT, `nombre_asignatura` INT, `nivel` INT, `letra` INT, `curso_nombre` INT, `curso_completo` INT, `curso_completo_descriptivo` INT);

-- -----------------------------------------------------
-- Placeholder table for view `colegio_aml`.`vista_asistencia_completa`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `colegio_aml`.`vista_asistencia_completa` (`id_asistencia` INT, `fecha` INT, `estado` INT, `hora_llegada` INT, `observaciones` INT, `metodo_registro` INT, `id_alumno` INT, `nombre_alumno` INT, `apellido_paterno` INT, `apellido_materno` INT, `nombre_completo_alumno` INT, `email_alumno` INT, `id_curso` INT, `nombre_curso` INT, `nivel` INT, `letra` INT, `id_profesor` INT, `nombre_profesor` INT, `apellido_profesor` INT, `nombre_completo_profesor` INT, `id_huella` INT, `dedo_usado` INT, `calidad_huella` INT, `comuna` INT, `created_at` INT, `updated_at` INT);

-- -----------------------------------------------------
-- Placeholder table for view `colegio_aml`.`vista_estadisticas_huellas`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `colegio_aml`.`vista_estadisticas_huellas` (`total_huellas_registradas` INT, `alumnos_con_huella` INT, `calidad_promedio` INT, `calidad_minima` INT, `calidad_maxima` INT, `huellas_activas` INT, `huellas_inactivas` INT);

-- -----------------------------------------------------
-- View `colegio_aml`.`vista_asignaciones_completa`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `colegio_aml`.`vista_asignaciones_completa`;
DROP VIEW IF EXISTS `colegio_aml`.`vista_asignaciones_completa` ;
USE `colegio_aml`;
CREATE  OR REPLACE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `colegio_aml`.`vista_asignaciones_completa` AS select `a`.`id_asignacion` AS `id_asignacion`,`a`.`id_profesor_fk` AS `id_profesor`,`a`.`id_asignatura_fk` AS `id_asignatura`,`a`.`id_curso_fk` AS `id_curso`,`a`.`activo` AS `activo`,`a`.`created_at` AS `created_at`,`a`.`updated_at` AS `updated_at`,`p`.`nombre` AS `profesor_nombre`,`p`.`apellido` AS `profesor_apellido`,concat(`p`.`nombre`,' ',`p`.`apellido`) AS `profesor_completo`,`p`.`email` AS `profesor_email`,`p`.`especialidad` AS `profesor_especialidad`,`asig`.`nombre` AS `asignatura_nombre`,`asig`.`nombre` AS `nombre_asignatura`,`c`.`nivel` AS `nivel`,`c`.`letra` AS `letra`,`c`.`nombre` AS `curso_nombre`,concat(`c`.`nivel`,'° ',`c`.`letra`) AS `curso_completo`,concat((case `c`.`nivel` when 1 then '1° Básico' when 2 then '2° Básico' when 3 then '3° Básico' when 4 then '4° Básico' when 5 then '5° Básico' when 6 then '6° Básico' when 7 then '7° Básico' when 8 then '8° Básico' when 9 then '1° Medio' when 10 then '2° Medio' when 11 then '3° Medio' when 12 then '4° Medio' else concat(`c`.`nivel`,'°') end),' ',`c`.`letra`) AS `curso_completo_descriptivo` from (((`colegio_aml`.`asignaciones` `a` join `colegio_aml`.`profesores` `p` on((`a`.`id_profesor_fk` = `p`.`id_profesor`))) join `colegio_aml`.`asignaturas` `asig` on((`a`.`id_asignatura_fk` = `asig`.`id_asignatura`))) join `colegio_aml`.`cursos` `c` on((`a`.`id_curso_fk` = `c`.`id_curso`)));

-- -----------------------------------------------------
-- View `colegio_aml`.`vista_asistencia_completa`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `colegio_aml`.`vista_asistencia_completa`;
DROP VIEW IF EXISTS `colegio_aml`.`vista_asistencia_completa` ;
USE `colegio_aml`;
CREATE  OR REPLACE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `colegio_aml`.`vista_asistencia_completa` AS select `a`.`id_asistencia` AS `id_asistencia`,`a`.`fecha` AS `fecha`,`a`.`estado` AS `estado`,`a`.`hora_llegada` AS `hora_llegada`,`a`.`observaciones` AS `observaciones`,`a`.`metodo_registro` AS `metodo_registro`,`al`.`id_alumno` AS `id_alumno`,`al`.`nombre` AS `nombre_alumno`,`al`.`apellido_paterno` AS `apellido_paterno`,`al`.`apellido_materno` AS `apellido_materno`,concat(`al`.`nombre`,' ',`al`.`apellido_paterno`,' ',`al`.`apellido_materno`) AS `nombre_completo_alumno`,`al`.`email` AS `email_alumno`,`c`.`id_curso` AS `id_curso`,`c`.`nombre` AS `nombre_curso`,`c`.`nivel` AS `nivel`,`c`.`letra` AS `letra`,`p`.`id_profesor` AS `id_profesor`,`p`.`nombre` AS `nombre_profesor`,`p`.`apellido` AS `apellido_profesor`,concat(`p`.`nombre`,' ',`p`.`apellido`) AS `nombre_completo_profesor`,`h`.`id_huella` AS `id_huella`,`h`.`dedo` AS `dedo_usado`,`h`.`calidad` AS `calidad_huella`,`com`.`nombre` AS `comuna`,`a`.`created_at` AS `created_at`,`a`.`updated_at` AS `updated_at` from (((((`colegio_aml`.`asistencias` `a` join `colegio_aml`.`alumnos` `al` on((`a`.`id_alumno` = `al`.`id_alumno`))) left join `colegio_aml`.`cursos` `c` on((`al`.`id_curso_fk` = `c`.`id_curso`))) left join `colegio_aml`.`profesores` `p` on((`a`.`id_profesor` = `p`.`id_profesor`))) left join `colegio_aml`.`huellas_dactilares` `h` on((`a`.`id_huella_usada` = `h`.`id_huella`))) left join `colegio_aml`.`comunas` `com` on((`al`.`id_comuna_fk` = `com`.`id_comuna`))) where (`al`.`activo` = 1);

-- -----------------------------------------------------
-- View `colegio_aml`.`vista_estadisticas_huellas`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `colegio_aml`.`vista_estadisticas_huellas`;
DROP VIEW IF EXISTS `colegio_aml`.`vista_estadisticas_huellas` ;
USE `colegio_aml`;
CREATE  OR REPLACE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `colegio_aml`.`vista_estadisticas_huellas` AS select count(0) AS `total_huellas_registradas`,count(distinct `colegio_aml`.`huellas_dactilares`.`id_alumno`) AS `alumnos_con_huella`,avg(`colegio_aml`.`huellas_dactilares`.`calidad`) AS `calidad_promedio`,min(`colegio_aml`.`huellas_dactilares`.`calidad`) AS `calidad_minima`,max(`colegio_aml`.`huellas_dactilares`.`calidad`) AS `calidad_maxima`,sum((case when (`colegio_aml`.`huellas_dactilares`.`activa` = 1) then 1 else 0 end)) AS `huellas_activas`,sum((case when (`colegio_aml`.`huellas_dactilares`.`activa` = 0) then 1 else 0 end)) AS `huellas_inactivas` from `colegio_aml`.`huellas_dactilares`;

SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;

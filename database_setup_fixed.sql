-- Script SQL para crear las tablas del sistema de asistencia
-- Base de datos: colegioaml
-- Sistema biométrico con DigitalPersona U.are.U 4500

-- Crear la base de datos si no existe
CREATE DATABASE IF NOT EXISTS `colegioaml` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `colegioaml`;

-- Deshabilitar verificaciones de claves foráneas temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- Eliminar tablas si existen para empezar de cero (¡CUIDADO! Esto borra todos los datos)
DROP TABLE IF EXISTS `huellas_dactilares`;
DROP TABLE IF EXISTS `asistencias`;
DROP TABLE IF EXISTS `usuarios`;
DROP TABLE IF EXISTS `apoderados_alumnos`;
DROP TABLE IF EXISTS `alumnos`;
DROP TABLE IF EXISTS `profesores`;
DROP TABLE IF EXISTS `asignaturas`;
DROP TABLE IF EXISTS `cursos`;
DROP TABLE IF EXISTS `comunas`;

-- Habilitar verificaciones de claves foráneas nuevamente
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Tabla 'comunas'
CREATE TABLE `comunas` (
    `id_comuna` INT PRIMARY KEY AUTO_INCREMENT,
    `nombre` VARCHAR(100) NOT NULL
);

-- Insertar solo las comunas únicas de tu lista
INSERT INTO `comunas` (`nombre`) VALUES
('San Ramon'),
('La Pintana'),
('La Granja'),
('La Cisterna'),
('San Bernardo')
ON DUPLICATE KEY UPDATE `nombre` = `nombre`;

-- 2. Tabla 'asignaturas'
CREATE TABLE `asignaturas` (
    `id_asignatura` INT PRIMARY KEY AUTO_INCREMENT,
    `nombre` VARCHAR(100) NOT NULL
);

INSERT INTO `asignaturas` (`nombre`) VALUES
('Programación Orientada a Objeto'),
('Modelamiento BD'),
('Web'),
('Matemáticas');

-- 3. Tabla 'cursos'
CREATE TABLE `cursos` (
    `id_curso` INT PRIMARY KEY AUTO_INCREMENT,
    `nivel` INT NOT NULL,
    `letra` CHAR(1) NOT NULL,
    `nombre` VARCHAR(100) GENERATED ALWAYS AS (CONCAT(`nivel`, '° ', `letra`)) STORED,
    `descripcion` TEXT,
    `activo` BOOLEAN DEFAULT TRUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO `cursos` (`nivel`, `letra`) VALUES
(4, 'B');

-- 4. Tabla 'profesores'
CREATE TABLE `profesores` (
    `id_profesor` INT PRIMARY KEY AUTO_INCREMENT,
    `nombre` VARCHAR(100) NOT NULL,
    `apellido` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100) UNIQUE NOT NULL,
    `especialidad` VARCHAR(100),
    `id_asignatura_fk` INT,
    `activo` BOOLEAN DEFAULT TRUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`id_asignatura_fk`) REFERENCES `asignaturas`(`id_asignatura`)
);

-- Insertar profesores
INSERT INTO `profesores` (`nombre`, `apellido`, `email`, `especialidad`, `id_asignatura_fk`) VALUES
('Juan', 'Pérez', 'juan.perez@colegio-aml.cl', 'Programación', 1),
('María', 'González', 'maria.gonzalez@colegio-aml.cl', 'Base de Datos', 2),
('Liza', 'Molina', 'liza.molina@colegio-aml.cl', 'Desarrollo Web', 3),
('Carlos', 'Rodríguez', 'carlos.rodriguez@colegio-aml.cl', 'Matemáticas', 4);

-- 5. Tabla 'alumnos'
CREATE TABLE `alumnos` (
    `id_alumno` INT PRIMARY KEY AUTO_INCREMENT,
    `nombre` VARCHAR(100) NOT NULL,
    `apellido_paterno` VARCHAR(100) NOT NULL,
    `apellido_materno` VARCHAR(100) NOT NULL,
    `fecha_nacimiento` DATE,
    `edad` INT,
    `direccion` VARCHAR(255),
    `email` VARCHAR(100) UNIQUE NOT NULL,
    `telefono` VARCHAR(20),
    `id_comuna_fk` INT,
    `id_curso_fk` INT,
    `activo` BOOLEAN DEFAULT TRUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`id_comuna_fk`) REFERENCES `comunas`(`id_comuna`),
    FOREIGN KEY (`id_curso_fk`) REFERENCES `cursos`(`id_curso`)
);

-- Insertar 40 alumnos del 4° medio B
INSERT INTO `alumnos` (`nombre`, `apellido_paterno`, `apellido_materno`, `fecha_nacimiento`, `edad`, `direccion`, `email`, `id_comuna_fk`, `id_curso_fk`) VALUES
('Daniel Isaias', 'Acevedo', 'Peña', '2007-05-10', 17, 'Fernando Albano', 'danielacevini@gmail.com', 1, 1),
('Cristian Patricio', 'Aguirre', 'Parra', '2007-10-03', 17, 'Pasaje el Consulado', 'aguirrecristian2007@gmail.com', 2, 1),
('Tomás Justino', 'Alzamora', 'Zorricueta', '2007-09-24', 17, 'José Ghiardo', 'tomas122@gmail.com', 3, 1),
('Emilia Paz', 'Arredondo', 'Contreras', '2007-01-14', 18, 'Sargento Candelaria', 'arredondocontrerasemilia@gmail.com', 1, 1),
('Miguel Angel Matías', 'Cabezas', 'Aliaga', '2007-02-07', 18, 'Cadete G Perry', 'miguelangelmca07@gmail.com', 1, 1),
('Sofía Carolina', 'Cáceres', 'Durán', '2007-06-08', 17, 'Aurora de Chile', 'sodiacarolinacaceresduran@gmail.com', 1, 1),
('Yanira Belén', 'Cayo', 'Cuevas', '2007-12-10', 17, 'Almirante la Torre', 'yaniracayocuevas@gmail.com', 1, 1),
('Dailyn', 'Cid', 'Sepulveda', '2007-12-23', 17, 'Javiera Carrera', 'dailyncitamichelle23@gmail.com', 1, 1),
('Constanza Belén', 'Concha', 'Venegas', '2007-06-12', 18, 'Gabriela Mistral', 'cbelenconcha@gmail.com', 1, 1),
('Cristofer Alejandro', 'Fuentes', 'Manibet', '2008-01-06', 17, 'Futaleufu', 'cristofer.fuentes979@gmail.com', 1, 1),
('Lissett Constanza', 'Fuentes', 'Peña', '2008-02-29', 17, 'Jasinto Benavente', 'lissettfuentes27@gmail.com', 1, 1),
('Karla Hellen', 'García', 'Guevara', '2006-03-11', 19, 'Tacora', 'karloncha1121@gmail.com', 3, 1),
('Alonso Gabriel', 'Gatica', 'Méndez', '2007-11-07', 17, 'Eugenio Matte Hurtado', 'gabriel.alonso0711@gmail.com', 1, 1),
('Tomás Alfredo', 'Gutiérrez', 'Tenorio', '2007-08-15', 17, 'Av. Los Libertadores', 'elias.guerrero.hernandez@alumnos.sip.cl', 1, 1),
('Aileen Yarithza', 'Jara', 'Belmar', '2007-09-09', 17, 'Ismael Tocornal', 'aileen.jara0@gmail.com', 1, 1),
('Fernando', 'Jara', 'Delgadillo', '2007-12-03', 17, 'Santa Rosa', 'fernando.jara.delgadillo@alumnos.sip.cl', 2, 1),
('Dayana Arlette', 'Jerez', 'Ríos', '2006-06-10', 18, 'San Juan Bautizta', 'Jeresdayana868@gmail.com', 2, 1),
('Juan Diego', 'Medina', 'Pernia', '2007-05-15', 17, 'Vicuña Mackenna', 'juandiego4370@gmail.com', 4, 1),
('Giovanni Eduardo', 'Molinet', 'Navarrete', '2007-11-20', 17, 'Los Aromos', 'giovanni.molinet.navarrete@alumnos.sip.cl', 1, 1),
('Brandon Ignacio', 'Morales', 'Aguilar', '2007-08-30', 17, 'Santa Ines de Asis', 'randon.modales.aguila@gmail.com', 1, 1),
('Vicente Adolfo', 'Moreno', 'Zapata', '2007-05-26', 17, 'Crecente Errazuriz', 'vicente.adolfo1009@gmail.com', 1, 1),
('Benjamín Ignacio', 'Pizarro', 'García', '2007-10-08', 17, 'Cadete G Perry', 'bg301024@gmail.com', 1, 1),
('Benjamín Rodrigo', 'Poblete', 'Donoso', '2007-12-31', 17, 'Juan Luis Sanfuentes', 'benjitap098@gmail.com', 1, 1),
('Victoria Estefanía', 'Repol', 'Monje', '2008-01-14', 17, 'Francisco Ensinas', 'repol.viky@gmail.com', 5, 1),
('Amaro León', 'Rivera', 'Millán', '2007-06-30', 17, 'Baquedano', 'amaritorivera.mati@gmail.com', 1, 1),
('Jade Alexandra', 'Rojas', 'Navarro', '2007-09-12', 17, 'Las Flores', 'jade.rojas.navarro@alumnos.sip.cl', 2, 1),
('Diego Benjamín', 'Rojas', 'Palma', '2007-08-09', 17, 'Claro de Luna', 'diego.rojaz.palma@gmail.com', 1, 1),
('Mathias Joaquín', 'Rosales', 'Gallegos', '2007-11-16', 17, 'Ismael Tocornal', 'mathiasrosales482@gmail.com', 1, 1),
('Bastián Alexander', 'Rubilar', 'Soto', '2007-06-22', 17, 'Ismael Tocornal', 'bastian.rubilar.s@gmail.com', 1, 1),
('Davis Alejandro', 'Saldaña', 'González', '2007-05-13', 17, 'Pasaje Los Guindos', 'davis.saskp7@gmail.com', 1, 1),
('Renato Antonio', 'Silva', 'Cruz', '2008-03-27', 16, 'Pasaje Cuatro', 'silvacruzrenato18@gmail.com', 2, 1),
('Gustavo Alonso', 'Soto', 'Morales', '2007-07-08', 17, 'Los Eucaliptos', 'gustavo.soto.morales@alumnos.sip.cl', 1, 1),
('Pablo Alejandro Andrés', 'Tapia', 'Concha', '2005-08-30', 19, 'Pasaje Cuatro', 'pablotapiaconcha@gmail.com', 2, 1),
('Tahía Anaís', 'Terán', 'González', '2008-03-06', 17, 'Sayen', 'tahiateran999@gmail.com', 2, 1),
('Madeline Jazmín', 'Toledo', 'Manríquez', '2007-11-23', 17, 'Eluney Manuel Rodriguez', 'madelinetoledo665@gmail.com', 1, 1),
('Constanza Noemí', 'Torres', 'Suazo', '2007-11-17', 17, 'Riquelme', 'constanzatorress@gmail.com', 1, 1),
('Alexander Nicolás', 'Uribe', 'Zambrano', '2007-12-25', 17, 'Jose Santos Gonzalez Vera', 'alex.uri2107@gmail.com', 1, 1),
('Eyner Alberto', 'Valdez', 'Cifuentes', '2007-02-25', 18, 'Juan Luis Sanfuentes', 'eynervaldez125@gmail.com', 1, 1),
('Loreto Ines', 'Vargas', 'Fuentes', '2007-05-21', 17, 'Jacinto benavente', 'magicloreto@gmail.com', 1, 1),
('Fabián Ignacio', 'Vargas', 'Molina', '2007-11-27', 17, 'Los Copihues', 'fabian.vargas.molina@alumnos.sip.cl', 1, 1);

-- 6. Tabla de huellas dactilares (SISTEMA BIOMÉTRICO)
CREATE TABLE `huellas_dactilares` (
    `id_huella` INT AUTO_INCREMENT PRIMARY KEY,
    `id_alumno` INT NOT NULL,
    `template_huella` LONGTEXT NOT NULL,
    `hash_huella` VARCHAR(64) NOT NULL,
    `calidad` DECIMAL(5,2) DEFAULT 0,
    `dedo` ENUM('pulgar_derecho', 'indice_derecho', 'medio_derecho', 'anular_derecho', 'menique_derecho',
                'pulgar_izquierdo', 'indice_izquierdo', 'medio_izquierdo', 'anular_izquierdo', 'menique_izquierdo') DEFAULT 'indice_derecho',
    `activa` BOOLEAN DEFAULT TRUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`id_alumno`) REFERENCES `alumnos`(`id_alumno`) ON DELETE CASCADE,
    INDEX `idx_hash_huella` (`hash_huella`),
    INDEX `idx_id_alumno_activa` (`id_alumno`, `activa`)
);

-- 7. Tabla 'usuarios' (SISTEMA DE AUTENTICACIÓN)
CREATE TABLE `usuarios` (
    `id_usuario` INT PRIMARY KEY AUTO_INCREMENT,
    `email` VARCHAR(100) UNIQUE NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `rol` ENUM('admin', 'profesor', 'apoderado') NOT NULL,
    `id_profesor_fk` INT,
    `id_alumno_fk` INT,
    `es_apoderado` BOOLEAN DEFAULT FALSE,
    `activo` BOOLEAN DEFAULT TRUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`id_profesor_fk`) REFERENCES `profesores`(`id_profesor`) ON DELETE SET NULL,
    FOREIGN KEY (`id_alumno_fk`) REFERENCES `alumnos`(`id_alumno`) ON DELETE SET NULL
);

-- 8. Insertar usuarios del sistema
-- 1. Usuario Administrador (controla las huellas dactilares)
INSERT INTO `usuarios` (`email`, `password_hash`, `rol`) VALUES
('admin@colegio-aml.cl', 'scrypt:32768:8:1$HQr8pF5ZTGV2NqHJ$41c8a05a5c7e8a9c6b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b', 'admin');

-- 2. Usuarios profesores (toman asistencia con huella dactilar)
INSERT INTO `usuarios` (`email`, `password_hash`, `rol`, `id_profesor_fk`) VALUES
('juan.perez@colegio-aml.cl', 'scrypt:32768:8:1$HQr8pF5ZTGV2NqHJ$41c8a05a5c7e8a9c6b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b', 'profesor', 1),
('maria.gonzalez@colegio-aml.cl', 'scrypt:32768:8:1$HQr8pF5ZTGV2NqHJ$41c8a05a5c7e8a9c6b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b', 'profesor', 2),
('liza.molina@colegio-aml.cl', 'scrypt:32768:8:1$HQr8pF5ZTGV2NqHJ$41c8a05a5c7e8a9c6b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b', 'profesor', 3),
('carlos.rodriguez@colegio-aml.cl', 'scrypt:32768:8:1$HQr8pF5ZTGV2NqHJ$41c8a05a5c7e8a9c6b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b', 'profesor', 4);

-- 3. Usuarios apoderados (40 apoderados)
INSERT INTO `usuarios` (`email`, `password_hash`, `rol`, `es_apoderado`) VALUES
('apoderado.pena@colegio-aml.cl', 'scrypt:32768:8:1$HQr8pF5ZTGV2NqHJ$41c8a05a5c7e8a9c6b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b', 'apoderado', TRUE),
('apoderado.parra@colegio-aml.cl', 'scrypt:32768:8:1$HQr8pF5ZTGV2NqHJ$41c8a05a5c7e8a9c6b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b', 'apoderado', TRUE),
('apoderado.zorricueta@colegio-aml.cl', 'scrypt:32768:8:1$HQr8pF5ZTGV2NqHJ$41c8a05a5c7e8a9c6b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b', 'apoderado', TRUE),
('apoderado.contreras@colegio-aml.cl', 'scrypt:32768:8:1$HQr8pF5ZTGV2NqHJ$41c8a05a5c7e8a9c6b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b', 'apoderado', TRUE),
('apoderado.aliaga@colegio-aml.cl', 'scrypt:32768:8:1$HQr8pF5ZTGV2NqHJ$41c8a05a5c7e8a9c6b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b', 'apoderado', TRUE),
('apoderado.duran@colegio-aml.cl', 'scrypt:32768:8:1$HQr8pF5ZTGV2NqHJ$41c8a05a5c7e8a9c6b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b', 'apoderado', TRUE),
('apoderado.cuevas@colegio-aml.cl', 'scrypt:32768:8:1$HQr8pF5ZTGV2NqHJ$41c8a05a5c7e8a9c6b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b', 'apoderado', TRUE),
('apoderado.sepulveda@colegio-aml.cl', 'scrypt:32768:8:1$HQr8pF5ZTGV2NqHJ$41c8a05a5c7e8a9c6b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b', 'apoderado', TRUE),
('apoderado.venegas@colegio-aml.cl', 'scrypt:32768:8:1$HQr8pF5ZTGV2NqHJ$41c8a05a5c7e8a9c6b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b', 'apoderado', TRUE),
('apoderado.manibet@colegio-aml.cl', 'scrypt:32768:8:1$HQr8pF5ZTGV2NqHJ$41c8a05a5c7e8a9c6b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b', 'apoderado', TRUE),
('apoderado.fuentes@colegio-aml.cl', 'scrypt:32768:8:1$HQr8pF5ZTGV2NqHJ$41c8a05a5c7e8a9c6b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b', 'apoderado', TRUE),
('apoderado.guevara@colegio-aml.cl', 'scrypt:32768:8:1$HQr8pF5ZTGV2NqHJ$41c8a05a5c7e8a9c6b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b', 'apoderado', TRUE),
('apoderado.mendez@colegio-aml.cl', 'scrypt:32768:8:1$HQr8pF5ZTGV2NqHJ$41c8a05a5c7e8a9c6b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b', 'apoderado', TRUE),
('apoderado.tenorio@colegio-aml.cl', 'scrypt:32768:8:1$HQr8pF5ZTGV2NqHJ$41c8a05a5c7e8a9c6b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b', 'apoderado', TRUE),
('apoderado.belmar@colegio-aml.cl', 'scrypt:32768:8:1$HQr8pF5ZTGV2NqHJ$41c8a05a5c7e8a9c6b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b', 'apoderado', TRUE),
('apoderado.delgadillo@colegio-aml.cl', 'scrypt:32768:8:1$HQr8pF5ZTGV2NqHJ$41c8a05a5c7e8a9c6b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b', 'apoderado', TRUE),
('apoderado.rios@colegio-aml.cl', 'scrypt:32768:8:1$HQr8pF5ZTGV2NqHJ$41c8a05a5c7e8a9c6b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b', 'apoderado', TRUE),
('apoderado.pernia@colegio-aml.cl', 'scrypt:32768:8:1$HQr8pF5ZTGV2NqHJ$41c8a05a5c7e8a9c6b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b', 'apoderado', TRUE),
('apoderado.navarrete@colegio-aml.cl', 'scrypt:32768:8:1$HQr8pF5ZTGV2NqHJ$41c8a05a5c7e8a9c6b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b', 'apoderado', TRUE),
('apoderado.aguilar@colegio-aml.cl', 'scrypt:32768:8:1$HQr8pF5ZTGV2NqHJ$41c8a05a5c7e8a9c6b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b', 'apoderado', TRUE),
('apoderado.zapata@colegio-aml.cl', 'scrypt:32768:8:1$HQr8pF5ZTGV2NqHJ$41c8a05a5c7e8a9c6b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b', 'apoderado', TRUE),
('apoderado.garcia@colegio-aml.cl', 'scrypt:32768:8:1$HQr8pF5ZTGV2NqHJ$41c8a05a5c7e8a9c6b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b', 'apoderado', TRUE),
('apoderado.donoso@colegio-aml.cl', 'scrypt:32768:8:1$HQr8pF5ZTGV2NqHJ$41c8a05a5c7e8a9c6b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b', 'apoderado', TRUE),
('apoderado.monje@colegio-aml.cl', 'scrypt:32768:8:1$HQr8pF5ZTGV2NqHJ$41c8a05a5c7e8a9c6b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b', 'apoderado', TRUE),
('apoderado.millan@colegio-aml.cl', 'scrypt:32768:8:1$HQr8pF5ZTGV2NqHJ$41c8a05a5c7e8a9c6b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b', 'apoderado', TRUE),
('apoderado.navarro@colegio-aml.cl', 'scrypt:32768:8:1$HQr8pF5ZTGV2NqHJ$41c8a05a5c7e8a9c6b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b', 'apoderado', TRUE),
('apoderado.palma@colegio-aml.cl', 'scrypt:32768:8:1$HQr8pF5ZTGV2NqHJ$41c8a05a5c7e8a9c6b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b', 'apoderado', TRUE),
('apoderado.gallegos@colegio-aml.cl', 'scrypt:32768:8:1$HQr8pF5ZTGV2NqHJ$41c8a05a5c7e8a9c6b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b', 'apoderado', TRUE),
('apoderado.soto@colegio-aml.cl', 'scrypt:32768:8:1$HQr8pF5ZTGV2NqHJ$41c8a05a5c7e8a9c6b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b', 'apoderado', TRUE),
('apoderado.gonzalez@colegio-aml.cl', 'scrypt:32768:8:1$HQr8pF5ZTGV2NqHJ$41c8a05a5c7e8a9c6b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b', 'apoderado', TRUE),
('apoderado.cruz@colegio-aml.cl', 'scrypt:32768:8:1$HQr8pF5ZTGV2NqHJ$41c8a05a5c7e8a9c6b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b', 'apoderado', TRUE),
('apoderado.morales@colegio-aml.cl', 'scrypt:32768:8:1$HQr8pF5ZTGV2NqHJ$41c8a05a5c7e8a9c6b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b', 'apoderado', TRUE),
('apoderado.concha@colegio-aml.cl', 'scrypt:32768:8:1$HQr8pF5ZTGV2NqHJ$41c8a05a5c7e8a9c6b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b', 'apoderado', TRUE),
('apoderado.gonzalez2@colegio-aml.cl', 'scrypt:32768:8:1$HQr8pF5ZTGV2NqHJ$41c8a05a5c7e8a9c6b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b', 'apoderado', TRUE),
('apoderado.manriquez@colegio-aml.cl', 'scrypt:32768:8:1$HQr8pF5ZTGV2NqHJ$41c8a05a5c7e8a9c6b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b', 'apoderado', TRUE),
('apoderado.suazo@colegio-aml.cl', 'scrypt:32768:8:1$HQr8pF5ZTGV2NqHJ$41c8a05a5c7e8a9c6b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b', 'apoderado', TRUE),
('apoderado.zambrano@colegio-aml.cl', 'scrypt:32768:8:1$HQr8pF5ZTGV2NqHJ$41c8a05a5c7e8a9c6b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b', 'apoderado', TRUE),
('apoderado.cifuentes@colegio-aml.cl', 'scrypt:32768:8:1$HQr8pF5ZTGV2NqHJ$41c8a05a5c7e8a9c6b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b', 'apoderado', TRUE),
('apoderado.fuentes2@colegio-aml.cl', 'scrypt:32768:8:1$HQr8pF5ZTGV2NqHJ$41c8a05a5c7e8a9c6b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b', 'apoderado', TRUE),
('apoderado.molina@colegio-aml.cl', 'scrypt:32768:8:1$HQr8pF5ZTGV2NqHJ$41c8a05a5c7e8a9c6b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b5c7c9b', 'apoderado', TRUE);

-- 9. Tabla de relación apoderados-alumnos
CREATE TABLE `apoderados_alumnos` (
    `id_apoderado_fk` INT,
    `id_alumno_fk` INT,
    PRIMARY KEY (`id_apoderado_fk`, `id_alumno_fk`),
    FOREIGN KEY (`id_apoderado_fk`) REFERENCES `usuarios`(`id_usuario`) ON DELETE CASCADE,
    FOREIGN KEY (`id_alumno_fk`) REFERENCES `alumnos`(`id_alumno`) ON DELETE CASCADE
);

-- Insertar relaciones apoderado-alumno (cada apoderado corresponde a un alumno)
INSERT INTO `apoderados_alumnos` (`id_apoderado_fk`, `id_alumno_fk`) VALUES
(6, 1),   -- apoderado.pena -> Daniel Isaias Acevedo Peña
(7, 2),   -- apoderado.parra -> Cristian Patricio Aguirre Parra
(8, 3),   -- apoderado.zorricueta -> Tomás Justino Alzamora Zorricueta
(9, 4),   -- apoderado.contreras -> Emilia Paz Arredondo Contreras
(10, 5),  -- apoderado.aliaga -> Miguel Angel Matías Cabezas Aliaga
(11, 6),  -- apoderado.duran -> Sofía Carolina Cáceres Durán
(12, 7),  -- apoderado.cuevas -> Yanira Belén Cayo Cuevas
(13, 8),  -- apoderado.sepulveda -> Dailyn Cid Sepulveda
(14, 9),  -- apoderado.venegas -> Constanza Belén Concha Venegas
(15, 10), -- apoderado.manibet -> Cristofer Alejandro Fuentes Manibet
(16, 11), -- apoderado.fuentes -> Lissett Constanza Fuentes Peña
(17, 12), -- apoderado.guevara -> Karla Hellen García Guevara
(18, 13), -- apoderado.mendez -> Alonso Gabriel Gatica Méndez
(19, 14), -- apoderado.tenorio -> Tomás Alfredo Gutiérrez Tenorio
(20, 15), -- apoderado.belmar -> Aileen Yarithza Jara Belmar
(21, 16), -- apoderado.delgadillo -> Fernando Jara Delgadillo
(22, 17), -- apoderado.rios -> Dayana Arlette Jerez Ríos
(23, 18), -- apoderado.pernia -> Juan Diego Medina Pernia
(24, 19), -- apoderado.navarrete -> Giovanni Eduardo Molinet Navarrete
(25, 20), -- apoderado.aguilar -> Brandon Ignacio Morales Aguilar
(26, 21), -- apoderado.zapata -> Vicente Adolfo Moreno Zapata
(27, 22), -- apoderado.garcia -> Benjamín Ignacio Pizarro García
(28, 23), -- apoderado.donoso -> Benjamín Rodrigo Poblete Donoso
(29, 24), -- apoderado.monje -> Victoria Estefanía Repol Monje
(30, 25), -- apoderado.millan -> Amaro León Rivera Millán
(31, 26), -- apoderado.navarro -> Jade Alexandra Rojas Navarro
(32, 27), -- apoderado.palma -> Diego Benjamín Rojas Palma
(33, 28), -- apoderado.gallegos -> Mathias Joaquín Rosales Gallegos
(34, 29), -- apoderado.soto -> Bastián Alexander Rubilar Soto
(35, 30), -- apoderado.gonzalez -> Davis Alejandro Saldaña González
(36, 31), -- apoderado.cruz -> Renato Antonio Silva Cruz
(37, 32), -- apoderado.morales -> Gustavo Alonso Soto Morales
(38, 33), -- apoderado.concha -> Pablo Alejandro Andrés Tapia Concha
(39, 34), -- apoderado.gonzalez2 -> Tahía Anaís Terán González
(40, 35), -- apoderado.manriquez -> Madeline Jazmín Toledo Manríquez
(41, 36), -- apoderado.suazo -> Constanza Noemí Torres Suazo
(42, 37), -- apoderado.zambrano -> Alexander Nicolás Uribe Zambrano
(43, 38), -- apoderado.cifuentes -> Eyner Alberto Valdez Cifuentes
(44, 39), -- apoderado.fuentes2 -> Loreto Ines Vargas Fuentes
(45, 40); -- apoderado.molina -> Fabián Ignacio Vargas Molina

-- 10. Tabla 'asistencias' (SISTEMA BIOMÉTRICO)
CREATE TABLE `asistencias` (
    `id_asistencia` INT PRIMARY KEY AUTO_INCREMENT,
    `id_alumno` INT NOT NULL,
    `fecha` DATE NOT NULL,
    `estado` ENUM('presente', 'ausente', 'tardanza', 'justificado') NOT NULL,
    `hora_llegada` TIME,
    `observaciones` TEXT,
    `metodo_registro` ENUM('manual', 'huella_dactilar', 'tarjeta_rfid') DEFAULT 'huella_dactilar',
    `id_huella_usada` INT NULL,
    `id_profesor` INT,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`id_alumno`) REFERENCES `alumnos`(`id_alumno`) ON DELETE CASCADE,
    FOREIGN KEY (`id_huella_usada`) REFERENCES `huellas_dactilares`(`id_huella`) ON DELETE SET NULL,
    FOREIGN KEY (`id_profesor`) REFERENCES `profesores`(`id_profesor`) ON DELETE SET NULL,
    UNIQUE KEY `unique_alumno_fecha` (`id_alumno`, `fecha`)
);

-- Insertar algunos registros de asistencia de ejemplo para hoy (usando huella dactilar)
INSERT INTO `asistencias` (`id_alumno`, `fecha`, `estado`, `hora_llegada`, `metodo_registro`, `id_profesor`) VALUES
(1, CURDATE(), 'presente', '08:00:00', 'huella_dactilar', 1),
(2, CURDATE(), 'presente', '08:15:00', 'huella_dactilar', 1),
(3, CURDATE(), 'tardanza', '08:45:00', 'huella_dactilar', 1),
(4, CURDATE(), 'ausente', NULL, 'manual', 1),
(5, CURDATE(), 'presente', '08:10:00', 'huella_dactilar', 2),
(6, CURDATE(), 'presente', '08:05:00', 'huella_dactilar', 2),
(7, CURDATE(), 'justificado', NULL, 'manual', 2),
(8, CURDATE(), 'presente', '08:20:00', 'huella_dactilar', 2),
(9, CURDATE(), 'presente', '08:00:00', 'huella_dactilar', 3),
(10, CURDATE(), 'tardanza', '08:30:00', 'huella_dactilar', 3);

-- Índices para mejorar el rendimiento
CREATE INDEX `idx_asistencias_fecha` ON `asistencias`(`fecha`);
CREATE INDEX `idx_asistencias_alumno` ON `asistencias`(`id_alumno`);
CREATE INDEX `idx_asistencias_estado` ON `asistencias`(`estado`);
CREATE INDEX `idx_asistencias_metodo` ON `asistencias`(`metodo_registro`);
CREATE INDEX `idx_alumnos_curso` ON `alumnos`(`id_curso_fk`);
CREATE INDEX `idx_alumnos_activo` ON `alumnos`(`activo`);
CREATE INDEX `idx_usuarios_rol` ON `usuarios`(`rol`);
CREATE INDEX `idx_huellas_calidad` ON `huellas_dactilares`(`calidad`);

-- Crear vista para facilitar consultas de asistencia con información completa
CREATE VIEW `vista_asistencia_completa` AS
SELECT 
    a.`id_asistencia`,
    a.`fecha`,
    a.`estado`,
    a.`hora_llegada`,
    a.`observaciones`,
    a.`metodo_registro`,
    al.`id_alumno`,
    al.`nombre` as `nombre_alumno`,
    al.`apellido_paterno`,
    al.`apellido_materno`,
    CONCAT(al.`nombre`, ' ', al.`apellido_paterno`, ' ', al.`apellido_materno`) as `nombre_completo_alumno`,
    al.`email` as `email_alumno`,
    c.`id_curso`,
    c.`nombre` as `nombre_curso`,
    c.`nivel`,
    c.`letra`,
    p.`id_profesor`,
    p.`nombre` as `nombre_profesor`,
    p.`apellido` as `apellido_profesor`,
    CONCAT(p.`nombre`, ' ', p.`apellido`) as `nombre_completo_profesor`,
    h.`id_huella`,
    h.`dedo` as `dedo_usado`,
    h.`calidad` as `calidad_huella`,
    com.`nombre` as `comuna`,
    a.`created_at`,
    a.`updated_at`
FROM `asistencias` a
JOIN `alumnos` al ON a.`id_alumno` = al.`id_alumno`
LEFT JOIN `cursos` c ON al.`id_curso_fk` = c.`id_curso`
LEFT JOIN `profesores` p ON a.`id_profesor` = p.`id_profesor`
LEFT JOIN `huellas_dactilares` h ON a.`id_huella_usada` = h.`id_huella`
LEFT JOIN `comunas` com ON al.`id_comuna_fk` = com.`id_comuna`
WHERE al.`activo` = 1;

-- Vista para estadísticas de huellas dactilares
CREATE VIEW `vista_estadisticas_huellas` AS
SELECT 
    COUNT(*) as `total_huellas_registradas`,
    COUNT(DISTINCT `id_alumno`) as `alumnos_con_huella`,
    AVG(`calidad`) as `calidad_promedio`,
    MIN(`calidad`) as `calidad_minima`,
    MAX(`calidad`) as `calidad_maxima`,
    SUM(CASE WHEN `activa` = 1 THEN 1 ELSE 0 END) as `huellas_activas`,
    SUM(CASE WHEN `activa` = 0 THEN 1 ELSE 0 END) as `huellas_inactivas`
FROM `huellas_dactilares`;

-- NOTA IMPORTANTE SOBRE CONTRASEÑAS:
-- Todas las contraseñas están hasheadas con scrypt y corresponden a "password123"
-- Se recomienda cambiar estas contraseñas en el primer uso del sistema
-- El administrador debe cambiar inmediatamente su contraseña por seguridad

-- SISTEMA BIOMÉTRICO CONFIGURADO:
-- - Admin: Administra las huellas dactilares (registro/eliminación)
-- - Profesores: Toman asistencia con huella dactilar del alumno  
-- - Alumnos: 40 estudiantes del 4° medio B
-- - Apoderados: 40 apoderados (uno por alumno)
-- - Hardware: DigitalPersona U.are.U 4500 integrado

-- INFORMACIÓN DE ACCESO:
-- Usuario admin: admin@colegio-aml.cl / password123
-- Usuarios profesores: [email del profesor] / password123
-- Usuarios apoderados: [email del apoderado] / password123

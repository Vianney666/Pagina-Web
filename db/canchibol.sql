CREATE DATABASE canchibol;

USE canchibol;

CREATE TABLE arbitro (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    email VARCHAR(200),
    telefono VARCHAR(20) not null,
    disponible BOOLEAN DEFAULT TRUE,
    fechaRegistro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE arbitro 
ADD estado TINYINT(1) DEFAULT 1 COMMENT '1=activo, 0=inactivo';

CREATE TABLE equipos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    representante VARCHAR(100) NOT NULL,
    telefono VARCHAR(20) NOT NULL
);

ALTER TABLE equipos 
ADD COLUMN estado TINYINT(1) DEFAULT 1 COMMENT '1=Activo, 0=Inactivo';

INSERT INTO equipos (nombre, representante, telefono, estado) VALUES 
('Bayern', 'Luis Adan Perez', '3331757710', 1),
('PSG', 'Luis Daniel Camacho', '3314385621', 1);


DROP TABLE IF EXISTS partido;

-- nueva tabla partido con llaves foraneas
CREATE TABLE partido (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    cancha VARCHAR(100) NOT NULL,
    arbitro_id INT NOT NULL,
    equipo1 INT NOT NULL,
    equipo2 INT NOT NULL,
    FOREIGN KEY (arbitro_id) REFERENCES arbitro(id),
    FOREIGN KEY (equipo1) REFERENCES equipos(id),
    FOREIGN KEY (equipo2) REFERENCES equipos(id)
);



CREATE TABLE `users` (
  `nombre` varchar(200) NOT NULL,
  `apellidoPaterno` varchar(200) NOT NULL,
  `apellidoMaterno` varchar(200) NOT NULL,
  `numEmpleado` int(15) NOT NULL,
  `correo` varchar(300) NOT NULL,
  `contrasenia` varchar(50) NOT NULL
)


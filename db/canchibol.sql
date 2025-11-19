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

CREATE TABLE partido (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    cancha VARCHAR(100) NOT NULL,
    arbitro_id INT NOT NULL,          
    equipo1 VARCHAR(100) NOT NULL,
    equipo2 VARCHAR(100) NOT NULL,
    FOREIGN KEY (arbitro_id) REFERENCES arbitro(id) 
);


CREATE TABLE `users` (
  `nombre` varchar(200) NOT NULL,
  `apellidoPaterno` varchar(200) NOT NULL,
  `apellidoMaterno` varchar(200) NOT NULL,
  `numEmpleado` int(15) NOT NULL,
  `correo` varchar(300) NOT NULL,
  `contrasenia` varchar(50) NOT NULL
)


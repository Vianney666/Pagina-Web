CREATE DATABASE canchibol;

USE canchibol;

CREATE TABLE arbitro (
    id INT(11) NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(200) NOT NULL,
    correo VARCHAR(100) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    disponible TINYINT(1) DEFAULT 1,
    fechaRegistro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    PRIMARY KEY (id)
);

CREATE TABLE `cancha` (
  `IdCancha` int(20) NOT NULL,
  `ancho` int(11) NOT NULL,
  `largo` int(11) NOT NULL,
  `tipoPasto` varchar(50) NOT NULL
)

CREATE TABLE `partido` (
  `titular` varchar(200) NOT NULL,
  `equipo1` varchar(50) NOT NULL,
  `equipo2` varchar(50) NOT NULL,
  `fecha` date NOT NULL,
  `hora` time NOT NULL,
  `cancha` text NOT NULL
)

CREATE TABLE `users` (
  `nombre` varchar(200) NOT NULL,
  `apellidoPaterno` varchar(200) NOT NULL,
  `apellidoMaterno` varchar(200) NOT NULL,
  `numEmpleado` int(15) NOT NULL,
  `correo` varchar(300) NOT NULL,
  `contrasenia` varchar(50) NOT NULL
)

ALTER TABLE `users`
  ADD PRIMARY KEY (`numEmpleado`);

ALTER TABLE `cancha`
  MODIFY `IdCancha` int(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `users`
  MODIFY `numEmpleado` int(15) NOT NULL AUTO_INCREMENT;

ALTER TABLE `arbitro` DROP `apellidoPaterno`;

ALTER TABLE `arbitro` DROP `apellidoMaterno`;
COMMIT;
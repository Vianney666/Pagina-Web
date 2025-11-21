<?php
// consulta especifica para obtener solo equipos desactivados: en 0

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

include 'conexion.php';

$conexionBD = new ConexionBD();
$conn = $conexionBD->getConexion();

if (!$conn) {
    echo json_encode([]);
    exit;
}

$sql = "SELECT id, nombre, representante, telefono FROM equipos WHERE estado = 0 ORDER BY id DESC";
$result = $conn->query($sql);

$equipos = [];
if ($result && $result->num_rows > 0) {
    while ($fila = $result->fetch_assoc()) {
        $equipos[] = $fila;
    }
}

echo json_encode($equipos);

if ($conn) {
    $conn->close();
}

?>
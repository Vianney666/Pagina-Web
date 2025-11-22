
<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

include_once 'conexion.php';

$database = new ConexionBD();
$conexion = $database->getConexion();

if (!$conexion) {
    http_response_code(500);
    echo json_encode(["error" => "Error de conexión a la base de datos"]);
    exit;
}

// CAMBIO: Solo obtener árbitros activos (estado = 1)
$sql = "SELECT * FROM arbitro WHERE estado = 1 ORDER BY nombre";
$resultado = $conexion->query($sql);

if (!$resultado) {
    http_response_code(500);
    echo json_encode(["error" => "Error en la consulta: " . $conexion->error]);
    exit;
}

$arbitros = [];
while ($fila = $resultado->fetch_assoc()) {
    $arbitros[] = $fila;
}

echo json_encode($arbitros);

$conexion->close();

?>
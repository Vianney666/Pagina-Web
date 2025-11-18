
<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header("Cache-Control: no-cache, no-store, must-revalidate");
header("Pragma: no-cache");
header("Expires: 0");

include_once 'conexion.php';

$database = new ConexionBD();
$conexion = $database->getConexion();

if (!$conexion) {
    http_response_code(500);
    echo json_encode(["error" => "Error de conexión a la base de datos"]);
    exit;
}

$sql = "SELECT id, nombre, telefono, email, disponible FROM arbitro ORDER BY id";
$resultado = $conexion->query($sql);

if ($resultado && $resultado->num_rows > 0) {
    $arbitros = [];
    while($fila = $resultado->fetch_assoc()) {
        // convierte disponible al boleano
        $fila['disponible'] = (bool)$fila['disponible'];
        $arbitros[] = $fila;
    }
    echo json_encode($arbitros);
} else {
    echo json_encode([]);
}

$conexion->close();
?>
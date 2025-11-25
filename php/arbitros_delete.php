
<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

include_once 'conexion.php';

$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!$data || !isset($data['id'])) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "ID inválido"]);
    exit;
}

$database = new ConexionBD();
$conexion = $database->getConexion();

if (!$conexion) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Error de conexión a la base de datos"]);
    exit;
}

// en lugar de eliminar por completo, hacemos un cambio de estado 
$sql = "UPDATE arbitro SET estado = 0 WHERE id = ?";
$stmt = $conexion->prepare($sql);

if (!$stmt) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Error en la consulta: " . $conexion->error]);
    exit;
}

$stmt->bind_param("i", $data['id']);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Árbitro desactivado correctamente"]);
} else {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Error al desactivar: " . $stmt->error]);
}

$stmt->close();
$conexion->close();

?>
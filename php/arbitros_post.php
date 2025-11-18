
<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

include_once 'conexion.php';

$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!$data) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Datos inválidos"]);
    exit;
}

if (empty($data['nombre']) || empty($data['email']) || empty($data['telefono']) || !isset($data['disponible'])) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Faltan campos requeridos"]);
    exit;
}

$database = new ConexionBD();
$conexion = $database->getConexion();

if (!$conexion) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Error de conexión a la base de datos"]);
    exit;
}

$sql = "INSERT INTO arbitro (nombre, email, telefono, disponible) VALUES (?, ?, ?, ?)";
$stmt = $conexion->prepare($sql);

if (!$stmt) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Error en la consulta"]);
    exit;
}

$disponible = $data['disponible'] ? 1 : 0;
$stmt->bind_param("sssi", $data['nombre'], $data['email'], $data['telefono'], $disponible);

if ($stmt->execute()) {
    echo json_encode([
        "success" => true, 
        "id" => $stmt->insert_id
    ]);
} else {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Error al guardar"]);
}

$stmt->close();
$conexion->close();
?>
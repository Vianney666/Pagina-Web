<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

include_once 'conexion.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "Método no permitido"]);
    exit;
}

$database = new ConexionBD();
$conexion = $database->getConexion();

if (!$conexion) {
    http_response_code(500);
    echo json_encode(["error" => "Error de conexión a la base de datos"]);
    exit;
}

$id = $_POST['id'] ?? 0;
$nombre = $_POST['nombre'] ?? '';
$telefono = $_POST['telefono'] ?? '';
$correo = $_POST['correo'] ?? '';
$disponible = isset($_POST['disponible']) ? (int)$_POST['disponible'] : 1;

if (empty($id) || empty($nombre) || empty($telefono) || empty($correo)) {
    http_response_code(400);
    echo json_encode(["error" => "Datos incompletos"]);
    exit;
}

$sql = "UPDATE arbitro SET nombre = ?, telefono = ?, correo = ?, disponible = ? WHERE id = ?";
$stmt = $conexion->prepare($sql);

if ($stmt) {
    $stmt->bind_param("sssii", $nombre, $telefono, $correo, $disponible, $id);
    
    if ($stmt->execute()) {
        echo json_encode([
            "success" => true,
            "message" => "Árbitro actualizado exitosamente"
        ]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Error al actualizar árbitro: " . $stmt->error]);
    }
    $stmt->close();
} else {
    http_response_code(500);
    echo json_encode(["error" => "Error en la consulta: " . $conexion->error]);
}
?>
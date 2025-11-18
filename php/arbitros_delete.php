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

if (empty($id)) {
    http_response_code(400);
    echo json_encode(["error" => "ID requerido"]);
    exit;
}

$sql = "DELETE FROM arbitro WHERE id = ?";
$stmt = $conexion->prepare($sql);

if ($stmt) {
    $stmt->bind_param("i", $id);
    
    if ($stmt->execute()) {
        echo json_encode([
            "success" => true,
            "message" => "Árbitro eliminado exitosamente"
        ]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Error al eliminar árbitro: " . $stmt->error]);
    }
    $stmt->close();
} else {
    http_response_code(500);
    echo json_encode(["error" => "Error en la consulta: " . $conexion->error]);
}
?>
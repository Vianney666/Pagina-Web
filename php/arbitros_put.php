
<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: PUT');
header('Access-Control-Allow-Headers: Content-Type');

include_once 'conexion.php';

// Obtener los datos JSON
$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "JSON inválido"]);
    exit;
}

// Validar campos 
if (!isset($data['id']) || empty($data['nombre']) || empty($data['email']) || empty($data['telefono']) || !isset($data['disponible'])) {
    http_response_code(400);
    echo json_encode([
        "success" => false, 
        "error" => "Faltan campos requeridos"
    ]);
    exit;
}

$database = new ConexionBD();
$conexion = $database->getConexion();

if (!$conexion) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Error de conexión a la base de datos"]);
    exit;
}

// preparar y ejecutar la consulta
$sql = "UPDATE arbitro SET nombre = ?, email = ?, telefono = ?, disponible = ? WHERE id = ?";
$stmt = $conexion->prepare($sql);

if (!$stmt) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Error en preparación: " . $conexion->error]);
    exit;
}

// boleano para bd (true=1, false=0)
$disponible = $data['disponible'] ? 1 : 0;
$id = $data['id'];
$nombre = $data['nombre'];
$email = $data['email'];
$telefono = $data['telefono'];

$stmt->bind_param("sssii", $nombre, $email, $telefono, $disponible, $id);

if ($stmt->execute()) {
    
    if ($stmt->affected_rows > 0) {
        echo json_encode([
            "success" => true, 
            "message" => "Árbitro actualizado"
        ]);
    } else {
        echo json_encode([
            "success" => false, 
            "error" => "No se encontró el árbitro o los datos son iguales"
        ]);
    }
} else {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Error al ejecutar: " . $stmt->error]);
}

$stmt->close();
$conexion->close();
?>
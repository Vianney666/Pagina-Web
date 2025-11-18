
<?php
// crear nuevos arbitros

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

include_once 'conexion.php';

// Solo permitir método POST
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

// Obtener datos del formulario
$nombre = $_POST['nombre'] ?? '';
$telefono = $_POST['telefono'] ?? '';
$correo = $_POST['correo'] ?? '';
$disponible = isset($_POST['disponible']) ? (int)$_POST['disponible'] : 1;

// Validar datos requeridos
if (empty($nombre) || empty($telefono) || empty($correo)) {
    http_response_code(400);
    echo json_encode(["error" => "Todos los campos son requeridos"]);
    exit;
}

// Insertar en la base de datos
$sql = "INSERT INTO arbitro (nombre, telefono, correo, disponible) VALUES (?, ?, ?, ?)";
$stmt = $conexion->prepare($sql);

if ($stmt) {
    $stmt->bind_param("sssi", $nombre, $telefono, $correo, $disponible);
    
    if ($stmt->execute()) {
        echo json_encode([
            "success" => true,
            "message" => "Árbitro creado exitosamente",
            "id" => $stmt->insert_id
        ]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Error al crear árbitro: " . $stmt->error]);
    }
    $stmt->close();
} else {
    http_response_code(500);
    echo json_encode(["error" => "Error en la consulta: " . $conexion->error]);
}
?>
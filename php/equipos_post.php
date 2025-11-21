
<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

include 'conexion.php';

$conexionBD = new ConexionBD();
$conn = $conexionBD->getConexion();

if (!$conn) {
    echo json_encode(['success' => false, 'message' => 'Error de conexión a la base de datos']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $nombre = $_POST['nombre'] ?? '';
    $representante = $_POST['representante'] ?? '';
    $telefono = $_POST['telefono'] ?? '';
    
    if (empty($nombre) || empty($representante) || empty($telefono)) {
        echo json_encode(['success' => false, 'message' => 'Todos los campos son obligatorios']);
        exit;
    }
    
    $sql = "INSERT INTO equipos (nombre, representante, telefono, estado) VALUES (?, ?, ?, 1)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sss", $nombre, $representante, $telefono);
    
    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            echo json_encode(['success' => true, 'message' => 'Equipo creado correctamente', 'id' => $stmt->insert_id]);
        } else {
            echo json_encode(['success' => false, 'message' => 'No se pudo crear el equipo']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Error al crear equipo: ' . $stmt->error]);
    }
    
    $stmt->close();
} else {
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
}

$conn->close();


?>
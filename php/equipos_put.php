
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
    $id = $_POST['id'] ?? '';
    $nombre = $_POST['nombre'] ?? '';
    $representante = $_POST['representante'] ?? '';
    $telefono = $_POST['telefono'] ?? '';
    
    if (empty($id) || empty($nombre) || empty($representante) || empty($telefono)) {
        echo json_encode(['success' => false, 'message' => 'Todos los campos son obligatorios']);
        exit;
    }
    
    $sql = "UPDATE equipos SET nombre = ?, representante = ?, telefono = ? WHERE id = ? AND estado = 1";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sssi", $nombre, $representante, $telefono, $id);
    
    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            echo json_encode(['success' => true, 'message' => 'Información actualizada correctamente']);
        } else {
            echo json_encode(['success' => false, 'message' => 'No se encontró el equipo o no hubo cambios']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Error al actualizar equipo: ' . $stmt->error]);
    }
    
    $stmt->close();
} else {
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
}

$conn->close();


?>

<?php
// Cambiar el estado de los arbitros a activos (1 en BD)
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

include 'conexion.php';

$conexionBD = new ConexionBD();
$conn = $conexionBD->getConexion();

if (!$conn) {
    echo json_encode(['success' => false, 'message' => 'Error de conexión a la base de datos']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    $id = $data['id'] ?? '';
    
    if (empty($id)) {
        echo json_encode(['success' => false, 'message' => 'ID de árbitro es requerido']);
        exit;
    }
    
    // Reactivar arbitro (cambiar estado a 1)
    $sql = "UPDATE arbitro SET estado = 1 WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $id);
    
    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            echo json_encode(['success' => true, 'message' => 'Árbitro reactivado correctamente']);
        } else {
            echo json_encode(['success' => false, 'message' => 'No se encontró el árbitro']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Error al reactivar árbitro: ' . $stmt->error]);
    }
    
    $stmt->close();
} else {
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
}

$conn->close();

?>
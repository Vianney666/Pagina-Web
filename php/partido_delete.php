<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: DELETE');
header('Access-Control-Allow-Headers: Content-Type');

include 'conexion.php';

$conexionBD = new ConexionBD();
$conn = $conexionBD->getConexion();

if (!$conn) {
    echo json_encode(['success' => false, 'message' => 'Error de conexión a la base de datos']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] == 'DELETE') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $id = $data['id'] ?? '';
    
    if (empty($id)) {
        echo json_encode(['success' => false, 'message' => 'ID no proporcionado']);
        exit;
    }
    
    $sql = "DELETE FROM partido WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $id);
    
    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            echo json_encode(['success' => true, 'message' => 'Partido eliminado correctamente']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Partido no encontrado']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Error al eliminar partido: ' . $stmt->error]);
    }
    
    $stmt->close();
} else {
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
}

$conn->close();


?>
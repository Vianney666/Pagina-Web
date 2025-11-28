
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
    
    if (empty($id)) {
        echo json_encode(['success' => false, 'message' => 'ID de equipo es requerido']);
        exit;
    }
    
    // Verificar si el equipo está en uso en partidos activos
    $sqlCheck = "SELECT COUNT(*) as count FROM partido WHERE (equipo1 = ? OR equipo2 = ?)";
    $stmtCheck = $conn->prepare($sqlCheck);
    $stmtCheck->bind_param("ii", $id, $id);
    
    if ($stmtCheck->execute()) {
        $result = $stmtCheck->get_result();
        $row = $result->fetch_assoc();
        
        if ($row['count'] > 0) {
            echo json_encode(['success' => false, 'message' => 'No se puede eliminar el equipo porque está asignado a uno o más partidos.']);
            $stmtCheck->close();
            $conn->close();
            exit;
        }
    }
    $stmtCheck->close();
    
    // Cambiar estado a inactivo (0) en lugar de eliminar
    $sql = "UPDATE equipos SET estado = 0 WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $id);
    
    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            echo json_encode(['success' => true, 'message' => 'Equipo desactivado correctamente']);
        } else {
            echo json_encode(['success' => false, 'message' => 'No se encontró el equipo']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Error al desactivar equipo: ' . $stmt->error]);
    }
    
    $stmt->close();
} else {
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
}

$conn->close();

?>
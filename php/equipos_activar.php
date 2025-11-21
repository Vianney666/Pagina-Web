<?php
//consoluta cambiar el estado de los equipos a activos (1 en bd)

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

include 'conexion.php';

$conexionBD = new ConexionBD();
$conn = $conexionBD->getConexion();

if (!$conn) {
    echo json_encode(['success' => false, 'message' => 'Error de conexion a la base de datos']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $id = $_POST['id'] ?? '';
    
    if (empty($id)) {
        echo json_encode(['success' => false, 'message' => 'ID de equipo es requerido']);
        exit;
    }
    
    // Reactivar equipo (cambiar estado a 1)
    $sql = "UPDATE equipos SET estado = 1 WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $id);
    
    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            echo json_encode(['success' => true, 'message' => 'Equipo reactivado correctamente']);
        } else {
            echo json_encode(['success' => false, 'message' => 'No se encontro el equipo']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Error al reactivar equipo: ' . $stmt->error]);
    }
    
    $stmt->close();
} else {
    echo json_encode(['success' => false, 'message' => 'Metodo no permitido']);
}

$conn->close();

?>
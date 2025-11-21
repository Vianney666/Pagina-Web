
<?php
//solo trae equipos activos(1)

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

include 'conexion.php';

$conexionBD = new ConexionBD();
$conn = $conexionBD->getConexion();

if (!$conn) {
    echo json_encode(['success' => false, 'message' => 'Error de conexión a la base de datos']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    $sql = "SELECT id, nombre, representante, telefono, estado FROM equipos WHERE estado = 1 ORDER BY nombre";
    $stmt = $conn->prepare($sql);
    
    if ($stmt->execute()) {
        $result = $stmt->get_result();
        $equipos = [];
        
        while ($fila = $result->fetch_assoc()) {
            $equipos[] = $fila;
        }
        
        echo json_encode($equipos);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error al obtener equipos: ' . $stmt->error]);
    }
    
    $stmt->close();
} else {
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
}

$conn->close();

?>
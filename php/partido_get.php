
<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

include 'conexion.php';

$conexionBD = new ConexionBD();
$conn = $conexionBD->getConexion();

if (!$conn) {
    echo json_encode(['error' => 'Error de conexión a la base de datos']);
    exit;
}

//concatenacion
if (isset($_GET['id'])) {
    $id = $_GET['id'];
    
    $sql = "SELECT p.*, a.nombre as arbitro_nombre 
            FROM partido p 
            INNER JOIN arbitro a ON p.arbitro_id = a.id 
            WHERE p.id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        $partido = $result->fetch_assoc();
        echo json_encode(['success' => true, 'partido' => $partido]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Partido no encontrado']);
    }
    
    $stmt->close();
} else {
    $sql = "SELECT p.*, a.nombre as arbitro_nombre 
            FROM partido p 
            INNER JOIN arbitro a ON p.arbitro_id = a.id 
            ORDER BY p.fecha, p.hora";
    $result = $conn->query($sql);

    $partidos = [];
    if ($result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            $partidos[] = $row;
        }
    }

    echo json_encode($partidos);
}

$conn->close();


?>
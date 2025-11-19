
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
    $data = json_decode(file_get_contents('php://input'), true);
    
    $fecha = $data['fecha'] ?? '';
    $hora = $data['hora'] ?? '';
    $cancha = $data['cancha'] ?? '';
    $arbitro_id = $data['arbitro_id'] ?? '';
    $equipo1 = $data['equipo1'] ?? '';
    $equipo2 = $data['equipo2'] ?? '';
    
    if (empty($fecha) || empty($hora) || empty($cancha) || empty($arbitro_id) || empty($equipo1) || empty($equipo2)) {
        echo json_encode(['success' => false, 'message' => 'Todos los campos son requeridos']);
        exit;
    }
    
    
    // validar conflicto de cancha: misma fecha, misma hora, misma cancha
    $sql_conflicto_cancha = "SELECT id FROM partido WHERE fecha = ? AND hora = ? AND cancha = ?";
    $stmt_conflicto_cancha = $conn->prepare($sql_conflicto_cancha);
    $stmt_conflicto_cancha->bind_param("sss", $fecha, $hora, $cancha);
    $stmt_conflicto_cancha->execute();
    $result_conflicto_cancha = $stmt_conflicto_cancha->get_result();
    
    if ($result_conflicto_cancha->num_rows > 0) {
        $stmt_conflicto_cancha->close();
        echo json_encode(['success' => false, 'message' => 'La cancha ya está ocupada en esta fecha y hora']);
        exit;
    }

       $stmt_conflicto_cancha->close();
    
       
    //validar conflicto de arbitro: mismo arbitro, misma fecha, misma hora
    $sql_conflicto_arbitro = "SELECT id FROM partido WHERE fecha = ? AND hora = ? AND arbitro_id = ?";
    $stmt_conflicto_arbitro = $conn->prepare($sql_conflicto_arbitro);
    $stmt_conflicto_arbitro->bind_param("ssi", $fecha, $hora, $arbitro_id);
    $stmt_conflicto_arbitro->execute();
    $result_conflicto_arbitro = $stmt_conflicto_arbitro->get_result();
    
    if ($result_conflicto_arbitro->num_rows > 0) {
        $stmt_conflicto_arbitro->close();
        echo json_encode(['success' => false, 'message' => 'El árbitro ya tiene un partido asignado en esta fecha y hora']);
        exit;
    }
    $stmt_conflicto_arbitro->close();
    
 
    // inserta partidos si no hay conflicto  
    $sql = "INSERT INTO partido (fecha, hora, cancha, arbitro_id, equipo1, equipo2) VALUES (?, ?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sssiss", $fecha, $hora, $cancha, $arbitro_id, $equipo1, $equipo2);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Partido creado correctamente', 'id' => $stmt->insert_id]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error al crear partido: ' . $stmt->error]);
    }
    
    $stmt->close();
} else {
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
}

$conn->close();


?>
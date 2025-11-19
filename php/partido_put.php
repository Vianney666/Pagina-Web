
<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: PUT');
header('Access-Control-Allow-Headers: Content-Type');

include 'conexion.php';

$conexionBD = new ConexionBD();
$conn = $conexionBD->getConexion();

if (!$conn) {
    echo json_encode(['success' => false, 'message' => 'Error de conexión a la base de datos']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] == 'PUT') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $id = $data['id'] ?? '';
    $fecha = $data['fecha'] ?? '';
    $hora = $data['hora'] ?? '';
    $cancha = $data['cancha'] ?? '';
    $arbitro_id = $data['arbitro_id'] ?? '';
    $equipo1 = $data['equipo1'] ?? '';
    $equipo2 = $data['equipo2'] ?? '';
    
    if (empty($id) || empty($fecha) || empty($hora) || empty($cancha) ||
        empty($arbitro_id) || empty($equipo1) || empty($equipo2)) {
        
            echo json_encode(['success' => false, 'message' => 'Todos los campos son requeridos']);
            exit;
    }    
    
    //validar lo de cancha excluyendo el partido que se va editando
    $sql_conflicto_cancha = "SELECT id FROM partido WHERE fecha = ? AND hora = ? AND cancha = ? AND id != ?";
    $stmt_conflicto_cancha = $conn->prepare($sql_conflicto_cancha);
    $stmt_conflicto_cancha->bind_param("sssi", $fecha, $hora, $cancha, $id);
    $stmt_conflicto_cancha->execute();
    $result_conflicto_cancha = $stmt_conflicto_cancha->get_result();
    
    if ($result_conflicto_cancha->num_rows > 0) {
        $stmt_conflicto_cancha->close();
        echo json_encode(['success' => false, 'message' => 'La cancha ya está ocupada en esta fecha y hora']);
        exit;
    }
    
       $stmt_conflicto_cancha->close();

    
    //validar lo de arbitro excluyendo el partido que se va editando
    $sql_conflicto_arbitro = "SELECT id FROM partido WHERE fecha = ? AND hora = ? AND arbitro_id = ? AND id != ?";
    $stmt_conflicto_arbitro = $conn->prepare($sql_conflicto_arbitro);
    $stmt_conflicto_arbitro->bind_param("ssii", $fecha, $hora, $arbitro_id, $id);
    $stmt_conflicto_arbitro->execute();
    $result_conflicto_arbitro = $stmt_conflicto_arbitro->get_result();
    
    if ($result_conflicto_arbitro->num_rows > 0) {
        $stmt_conflicto_arbitro->close();
        echo json_encode(['success' => false, 'message' => 'El árbitro ya tiene un partido asignado en esta fecha y hora']);
        exit;
    }
    $stmt_conflicto_arbitro->close();
    
    //actualizar
    $sql = "UPDATE partido SET fecha=?, hora=?, cancha=?, arbitro_id=?, equipo1=?, equipo2=? WHERE id=?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sssissi", $fecha, $hora, $cancha, $arbitro_id, $equipo1, $equipo2, $id);
    
    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            echo json_encode(['success' => true, 'message' => 'Partido actualizado correctamente']);
        } else {
            echo json_encode(['success' => false, 'message' => 'No se realizaron cambios en el partido']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Error al actualizar partido: ' . $stmt->error]);
    }
    
    $stmt->close();
} else {
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
}

$conn->close();


?>
<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

include 'conexion.php';

// Usar la clase ConexionBD si existe, sino usar $conexion directamente
if (class_exists('ConexionBD')) {
    $conexionBD = new ConexionBD();
    $conn = $conexionBD->getConexion();
} else {
    // Fallback si usas la variable $conexion directamente
    $conn = $conexion;
}

if (!$conn) {
    echo json_encode(['success' => false, 'message' => 'Error de conexión a la base de datos']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    // Obtener parámetros opcionales
    $id = $_GET['id'] ?? null;
    $fecha = $_GET['fecha'] ?? null;
    $fecha_inicio = $_GET['fecha_inicio'] ?? null;
    $fecha_fin = $_GET['fecha_fin'] ?? null;
    $limit = $_GET['limit'] ?? null;
    
    // Caso 1: Obtener un partido específico por ID
    if ($id) {
        $sql = "SELECT id, hora, cancha, equipo1, equipo2 
                FROM partido 
                WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows > 0) {
            $partido = $result->fetch_assoc();
            echo json_encode($partido);
        } else {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Partido no encontrado']);
        }
        $stmt->close();
    }
    
    // Caso 2: Obtener partidos de una fecha específica
    elseif ($fecha) {
        if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $fecha)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Formato de fecha inválido. Use YYYY-MM-DD']);
            exit;
        }
        
        $sql = "SELECT id, hora, cancha, equipo1, equipo2 
                FROM partido 
                WHERE fecha = ? 
                ORDER BY hora ASC";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("s", $fecha);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $partidos = [];
        while ($row = $result->fetch_assoc()) {
            $partidos[] = $row;
        }
        
        echo json_encode($partidos);
        $stmt->close();
    }
    
    // Caso 3: Obtener partidos en un rango de fechas
    elseif ($fecha_inicio && $fecha_fin) {
        if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $fecha_inicio) || 
            !preg_match('/^\d{4}-\d{2}-\d{2}$/', $fecha_fin)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Formato de fecha inválido. Use YYYY-MM-DD']);
            exit;
        }
        
        $sql = "SELECT id, hora, cancha, equipo1, equipo2 
                FROM partido 
                WHERE fecha BETWEEN ? AND ? 
                ORDER BY fecha ASC, hora ASC";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ss", $fecha_inicio, $fecha_fin);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $partidos = [];
        while ($row = $result->fetch_assoc()) {
            $partidos[] = $row;
        }
        
        echo json_encode($partidos);
        $stmt->close();
    }
    
    // Caso 4: Obtener todos los partidos (puede incluir limit)
    else {
        $sql = "SELECT id, hora, cancha, equipo1, equipo2 
                FROM partido 
                ORDER BY fecha ASC, hora ASC";
        
        if ($limit) {
            $sql .= " LIMIT ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("i", $limit);
        } else {
            $stmt = $conn->prepare($sql);
        }
        
        $stmt->execute();
        $result = $stmt->get_result();
        
        $partidos = [];
        while ($row = $result->fetch_assoc()) {
            $partidos[] = $row;
        }
        
        // Devolver array directo
        echo json_encode($partidos);
        $stmt->close();
    }
    
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método no permitido. Use GET']);
}

$conn->close();
?>
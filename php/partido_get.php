<?php
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
    // Obtener parámetros opcionales
    $fecha = $_GET['fecha'] ?? null;
    $limit = $_GET['limit'] ?? null;
    
    if ($fecha) {
        // Obtener partidos de una fecha específica
        $sql = "SELECT p.*, a.nombre as arbitro_nombre 
                FROM partido p 
                LEFT JOIN arbitro a ON p.arbitro_id = a.id 
                WHERE p.fecha = ? 
                ORDER BY p.hora ASC";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("s", $fecha);
    } else {
        // Obtener todos los partidos ordenados por fecha y hora
        $sql = "SELECT p.*, a.nombre as arbitro_nombre 
                FROM partido p 
                LEFT JOIN arbitro a ON p.arbitro_id = a.id 
                ORDER BY p.fecha ASC, p.hora ASC";
        
        if ($limit) {
            $sql .= " LIMIT ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("i", $limit);
        } else {
            $stmt = $conn->prepare($sql);
        }
    }
    
    $stmt->execute();
    $result = $stmt->get_result();
    
    $partidos = [];
    while ($row = $result->fetch_assoc()) {
        $partidos[] = $row;
    }
    
    // Devolver en dos formatos para compatibilidad
    // Si se detecta que viene de la página de inicio, usar formato con success
    // Si viene del sistema de gestión, devolver array directo
    $userAgent = $_SERVER['HTTP_REFERER'] ?? '';
    
    if (strpos($userAgent, 'Inicioo.html') !== false || isset($_GET['formato']) && $_GET['formato'] === 'inicio') {
        echo json_encode([
            'success' => true, 
            'partidos' => $partidos,
            'total' => count($partidos)
        ]);
    } else {
        // Formato para el sistema de gestión (array directo)
        echo json_encode($partidos);
    }
    
    $stmt->close();
} else {
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
}

$conn->close();
?>
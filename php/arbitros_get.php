
<?php
// obtener lista con arbitros

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

include_once 'conexion.php';

$database = new ConexionBD();
$conexion = $database->getConexion();

// Verificar conexión
if (!$conexion) {
    http_response_code(500);
    echo json_encode(["error" => "Error de conexión a la base de datos"]);
    exit;
}

// Consulta para obtener árbitros
$sql = "SELECT id, nombre, telefono, correo, disponible FROM arbitro";
$resultado = $conexion->query($sql);

if ($resultado && $resultado->num_rows > 0) {
    $arbitros = [];
    while($fila = $resultado->fetch_assoc()) {
        $arbitros[] = $fila;
    }
    echo json_encode($arbitros);
} else {
    // Si no hay árbitros, devolver array vacío
    echo json_encode([]);
}
?>
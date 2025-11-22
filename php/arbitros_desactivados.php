
<?php
// Consulta especifica para obtener solo arbitros desactivados (estado 0)

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

include 'conexion.php';

$conexionBD = new ConexionBD();
$conn = $conexionBD->getConexion();

if (!$conn) {
    echo json_encode([]);
    exit;
}

$sql = "SELECT id, nombre, telefono, email, disponible FROM arbitro WHERE estado = 0 ORDER BY id DESC";
$result = $conn->query($sql);

$arbitros = [];
if ($result && $result->num_rows > 0) {
    while ($fila = $result->fetch_assoc()) {
        $arbitros[] = $fila;
    }
}

echo json_encode($arbitros);

if ($conn) {
    $conn->close();
}

?>
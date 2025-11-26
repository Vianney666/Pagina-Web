
<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');


include_once 'conexion.php';


if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $nombre = isset($data['nombre']) ? trim($data['nombre']) : '';
    $correo = isset($data['correo']) ? trim($data['correo']) : '';
    $contrasenia = isset($data['contrasenia']) ? $data['contrasenia'] : '';
    
    if (empty($nombre) || empty($correo) || empty($contrasenia)) {
        echo json_encode(["success" => false, "message" => "Todos los campos son obligatorios"]);
        exit;
    }
    
    if (!filter_var($correo, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(["success" => false, "message" => "Formato de correo inválido"]);
        exit;
    }
    
    $conexionBD = new ConexionBD();
    $conn = $conexionBD->getConexion();
    
    if ($conn === null) {
        echo json_encode(["success" => false, "message" => "Error de conexión a la base de datos"]);
        exit;
    }
    
    try {
        // verificar si el correo ya existe
        $check_email = $conn->prepare("SELECT correo FROM users WHERE correo = ?");
        $check_email->bind_param("s", $correo);
        $check_email->execute();
        $check_email->store_result();
        
        if ($check_email->num_rows > 0) {
            echo json_encode(["success" => false, "message" => "El correo ya está registrado"]);
            $check_email->close();
            exit;
        }
        $check_email->close();
        
        // guardar contraseña en texto plano
        $stmt = $conn->prepare("INSERT INTO users (nombre, apellidoPaterno, apellidoMaterno, correo, contrasenia) VALUES (?, NULL, NULL, ?, ?)");
        $stmt->bind_param("sss", $nombre, $correo, $contrasenia); // ← Sin hash
        
        if ($stmt->execute()) {
            echo json_encode(["success" => true, "message" => "Usuario registrado exitosamente"]);
        } else {
            echo json_encode(["success" => false, "message" => "Error al registrar usuario"]);
        }
        
        $stmt->close();
        
    } catch (Exception $e) {
        echo json_encode(["success" => false, "message" => "Error en el proceso"]);
    }
    
} else {
    echo json_encode(["success" => false, "message" => "Método no permitido"]);
}

?>
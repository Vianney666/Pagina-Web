<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

include_once 'conexion.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $correo = isset($data['correo']) ? trim($data['correo']) : '';
    $contrasenia = isset($data['contrasenia']) ? $data['contrasenia'] : '';
    
    if (empty($correo) || empty($contrasenia)) {
        echo json_encode(["success" => false, "message" => "Correo y contraseña son obligatorios"]);
        exit;
    }
    
    $conexionBD = new ConexionBD();
    $conn = $conexionBD->getConexion();
    
    if ($conn === null) {
        echo json_encode(["success" => false, "message" => "Error de conexión a la base de datos"]);
        exit;
    }
    
    try {
        // Buscar usuario por correo
        $stmt = $conn->prepare("SELECT numEmpleado, nombre, correo, contrasenia FROM users WHERE correo = ?");
        $stmt->bind_param("s", $correo);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows === 1) {
            $user = $result->fetch_assoc();
            
            // comparacion de texto plano
            if ($contrasenia === $user['contrasenia']) {
                // login exitoso
                session_start();
                $_SESSION['user_id'] = $user['numEmpleado'];
                $_SESSION['user_name'] = $user['nombre'];
                $_SESSION['user_email'] = $user['correo'];
                $_SESSION['logged_in'] = true;
                
                echo json_encode([
                    "success" => true, 
                    "message" => "Login exitoso",
                    "user" => [
                        "nombre" => $user['nombre'],
                        "correo" => $user['correo']
                    ]
                ]);
            } else {
                echo json_encode(["success" => false, "message" => "Contraseña incorrecta"]);
            }
        } else {
            echo json_encode(["success" => false, "message" => "Usuario no encontrado"]);
        }
        
        $stmt->close();
        
    } catch (Exception $e) {
        echo json_encode(["success" => false, "message" => "Error en el proceso de login"]);
    }
    
} else {
    echo json_encode(["success" => false, "message" => "Método no permitido"]);
  }

?>
<?php
class ConexionBD {
    private $host = "localhost";
    private $usuario = "root";
    private $password = "";
    private $bd = "canchibol";
    public $conexion;

    public function __construct() {
        $this->conexion = new mysqli($this->host, $this->usuario, $this->password, $this->bd);
        
        // manejo silencioso 
        if($this->conexion->connect_error) {
            $this->conexion = null;
        }
    }

    public function getConexion() {
        return $this->conexion;
    }
}




























































/*class ConexionBD {
    private $host = "localhost";
    private $usuario = "root";
    private $password = "";
    private $bd = "canchibol";
    private $conexion;

    public function __construc() {
        $this->conexion = new mysqli($this->host, $this->usuario, $this->password, $this->bd);

        if($this->conexion->connect_error) {
            die("Error de conexion: " . $this->conexion->connect_error);
        }
    }
    

    public function registrarUsuario($nombre, $correo, $contrasenia) {
        $sql="INSERT INTO users (nombre, correo, contrasenia) VALUES (?,?,?)";
        $stmt=$this->conexion->prepare($sql);
        $stmt->bind_param("sss", $nombre, $correo, $contrasenia);

        if ($stmt->execute()) {
            return ["success" => true, "mensaje" => "Usuario registrado"];
        } else {
            return ["success" => false, "error" => $stmt->error];
        }
    }

    public function login($correo, $contrasenia) {
        $sql = "SELECT * FROM users WHERE correo = ? AND contrasenia = ?";
        $stmt=$this->conexion->prepare($sql);
        $stmt->bond_param("ss", $correo, $contrasenia);
        $stmt->execute();
        $resultado = $stmt->get_result();

        if($resultado->num_rows > 0) {
            return ["success" => true, "usuario" => $resultado->fetch_assoc()];
        } else {
            return ["success" => false, "error" => "Credenciales incorrectas"];
        }
    }

    public function obtenerArbitros() {
        $sql="SELECT * FROM arbitro";
        $resultado = $this->conexion->query($sql);
        $arbitros=[];

        while($fila=$resultado->fetch_assoc()) {
            $arbitros[]=$fila
        }
        return $arbitros;
    }
    public function crearArbitro($nombre, $telefono, $correo, $disponible) {
        $sql = "INSERT INTO arbitro (nombre, telefono, correo, disponible) VALUES (?,?,?,?)";
        $stmt = $this->conexion->prepare($sql);
        $stmt->bind_param("sssi", $nombre, $telefono, $correo, $disponible);
        return $stmt->execute();
    }

    public function actualizarArbitro($id, $nombre, $correo, $disponible) {
        $sql="UPDATE arbitro SET nombre=?, telefono=?, correo=?, disponible=? WHERE id_arbitro=?";
        $stmt = $this->conexion->prepare($sql);
        $stmt->bind_param("sssii", $nombre, $telefono, $correo, $disponible, $id);

        return $stmt->execute();
    }

    public function eliminarArbitro($id) {
        $sql = "DELETE FROM arbitro WHERE id_arbitro=?";
        $stmt = $this->conexion->prepare($sql);
        $stmt->bind_param("i", $id);

        return $stmt->execute();
    }



    public function obtenerPartidos() {
        $sql = "SELECT * FROM partido ORDER BY fecha, hora";
        $resultado = $this->conexion->query($sql);
        $partidos =[];

        while ($fila = $resultado->fetch_assoc()) {
            $partidos[] = $fila;
        }
        return $partidos;
    }

    public function crearPartido($equipo1, $equipo2, $fecha, $hora, $cancha, $titular) {
        $sql="INSERT INTO partido (equipo1, equipo2, fecha, hora, cancha, titular) VALUES (?, ?, ?, ?, ?, ?)";
        $stmt=$this->conexion->prepare($sql);
        $stmt->bind_param("ssssss", $equipo1, $equipo2, $fecha, $hora, $cancha, $titular);

        return $stmt->execute();
    }

    public function obtenerPartidosPorFecha($fecha) {
        $sql = "SELECT * FROM partido WHERE fecha = ? PRDER BY hora";
        $stmt->this->conexion->prepare($sql);
        $stmt->execute();
        $resultado=$stmt->get_result();

        $partidos = [];
        while($fila=$resultado->fetch_assoc()){
            $partidos[] = $fila;
        }
        return $partidos;
    }
}

if ($_POST['action']){
    $db=new ConexionBD();
    $action=$_POST['action'];

    switch($action) {
        case 'login':
            $response=$db->login($_POST['correo'], $_POST['contrasenia']);
            break;

        case 'registrar':
            $response=$db->login($_POST['nombre'], $_POST['correo'], $_POST['contrasenia']);
            break;

        case 'obtener_arbitros':
            $response=$db->obtenerArbitros();
            break;

        case 'crear_arbitro':
            $response=$db->crearArbitro($_POST['nombre'], $_POST['telefono'], $_POST['correo'], $_POST['disponible']);
            break;

        case 'obtener_partidos':
            $response=$db->obtenerPartidos();
            break;

        case 'crear_partido':
            $response=$db->crearPartido($_POST['equipo1'], $_POST['equipo2'], $_POST['fecha'], $_POST['hora'], $_POST['cancha'], $_POST['titular']);
            break;
    }

    echo json_encode($response);
} */
?>
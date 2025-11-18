
<?php
class ConexionBD {
    private $host = "localhost";
    private $usuario = "root";
    private $password = "";
    private $bd = "canchibol";
    private $conexion;

    public function __construct() {
        $this->conexion = new mysqli($this->host, $this->usuario, $this->password, $this->bd);
        
        if ($this->conexion->connect_error) {
            error_log("Error de conexión: " . $this->conexion->connect_error);
            $this->conexion = null;
        } else {
            // establecer charset
            $this->conexion->set_charset("utf8");
        }
    }

    public function getConexion() {
        return $this->conexion;
    }
}
?>

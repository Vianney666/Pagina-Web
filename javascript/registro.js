
const togglePass1 = document.getElementById('togglePass1');
const togglePass2 = document.getElementById('togglePass2');
const pass1 = document.getElementById('password');
const pass2 = document.getElementById('confirmar');

// funcion mostrar/ocultar contraseñas
togglePass1.addEventListener('click', () => {
    const isPassword = pass1.type === 'password';
    pass1.type = isPassword ? 'text' : 'password';
    togglePass1.textContent = isPassword ? 'ocultar' : 'ver';
});

togglePass2.addEventListener('click', () => {
    const isPassword = pass2.type === 'password';
    pass2.type = isPassword ? 'text' : 'password';
    togglePass2.textContent = isPassword ? 'ocultar' : 'ver';
});


const usuario = document.getElementById('usuario');
const correo = document.getElementById('correo');
const password = document.getElementById('password');
const confirmar = document.getElementById('confirmar');

const usuarioError = document.getElementById('usuario-error');
const correoError = document.getElementById('correo-error');
const passwordError = document.getElementById('password-error');
const confirmarError = document.getElementById('confirmar-error');

// validacion en tiempo real (mientras escribe)
usuario.addEventListener('input', () => {
    usuarioError.style.display = usuario.value.trim() ? 'none' : 'block';
});

correo.addEventListener('input', () => {
    const correoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.value);
    correoError.style.display = correoValido ? 'none' : 'block';
});

password.addEventListener('input', () => {
    passwordError.style.display = password.value.trim() ? 'none' : 'block';
   
    if (confirmar.value) {
        confirmarError.style.display = (confirmar.value === password.value) ? 'none' : 'block';
    }
});

confirmar.addEventListener('input', () => {
    confirmarError.style.display = (confirmar.value === password.value) ? 'none' : 'block';
});


// mensaje de registro exitoso
function mostrarRegistroExitoso(nombreUsuario) {
    const pantallaCarga = document.getElementById('pantallaCarga');
    const mensajeRegistro = document.getElementById('mensajeRegistro');
    
    if (pantallaCarga && mensajeRegistro) {
        mensajeRegistro.textContent = `¡Registro exitoso! Bienvenido ${nombreUsuario} a Canchibol`;
        pantallaCarga.classList.add('mostrar');
    }
}


function ocultarPantallaCarga() {
    const pantallaCarga = document.getElementById('pantallaCarga');
    if (pantallaCarga) {
        pantallaCarga.classList.remove('mostrar');
    }
}


document.addEventListener('DOMContentLoaded', ocultarPantallaCarga);
window.addEventListener('pageshow', function(event) {
    if (event.persisted) {
        ocultarPantallaCarga();
    }
});

// control de timeout
let redireccionTimeout = null;

document.addEventListener('DOMContentLoaded', function() {
    if (redireccionTimeout) {
        clearTimeout(redireccionTimeout);
    }
    ocultarPantallaCarga();
});

// fun principal: envio del formulario 
const form = document.getElementById('registroForm');
form.addEventListener('submit', async (e) => {
    e.preventDefault(); 
    
    let valido = true;

    // resetear errores
    usuarioError.style.display = 'none';
    correoError.style.display = 'none';
    passwordError.style.display = 'none';
    confirmarError.style.display = 'none';

    if (!usuario.value.trim()) {
        usuarioError.style.display = 'block';
        valido = false;
    }

    const correoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.value);
    if (!correoValido) {
        correoError.style.display = 'block';
        valido = false;
    }

    if (!password.value.trim()) {
        passwordError.style.display = 'block';
        valido = false;
    }

    if (password.value !== confirmar.value) {
        confirmarError.style.display = 'block';
        valido = false;
    }

    //enviar datos al servidor
    if (valido) {
        try {
            const response = await fetch('../php/registro.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nombre: usuario.value.trim(),
                    correo: correo.value.trim(),
                    contrasenia: password.value
                })
            });

            const result = await response.json();

            if (result.success) {
                mostrarRegistroExitoso(usuario.value.trim());
                
                if (redireccionTimeout) {
                    clearTimeout(redireccionTimeout);
                }
                
                redireccionTimeout = setTimeout(() => {
                    window.location.href = '../html/admin.html';
                }, 3000);
                
            } else {
                alert("Error: " + result.message);
            }
        } catch (error) {
            console.error('Error:', error);
            alert("Error de conexión. Intenta nuevamente.");
        }
    }
});
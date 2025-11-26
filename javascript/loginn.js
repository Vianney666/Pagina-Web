
const togglePassword = document.getElementById('togglePassword');
const password = document.getElementById('password');

// mostrar/ocultar contraseña
togglePassword.addEventListener('click', () => {
    const isPassword = password.type === 'password';
    password.type = isPassword ? 'text' : 'password';
    togglePassword.textContent = isPassword ? 'ocultar' : 'ver';
    togglePassword.setAttribute('aria-label', isPassword ? 'Ocultar contraseña' : 'Mostrar contraseña');
});


const correo = document.getElementById('correo'); 
const correoError = document.getElementById('correo-error'); 
const passwordError = document.getElementById('password-error');

// validar en tiempo real mientras escribe
correo.addEventListener('input', () => {
    const correoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.value);
    correoError.style.display = correoValido ? 'none' : 'block';
    correoError.textContent = correoValido ? '' : 'Correo inválido'; 
});

password.addEventListener('input', () => {
    passwordError.style.display = password.value.trim() ? 'none' : 'block';
});

// envio del formulario
const form = document.getElementById('loginForm');
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    let valido = true;

    // resetear errores
    correoError.style.display = 'none';
    passwordError.style.display = 'none';

    // validaciones
    const correoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.value);
    if (!correoValido) {
        correoError.style.display = 'block';
        correoError.textContent = 'Correo inválido';
        valido = false;
    }

    if (!password.value.trim()) {
        passwordError.style.display = 'block';
        valido = false;
    }

  
    if (valido) {
        try {
            const response = await fetch('../php/login.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    correo: correo.value.trim(),
                    contrasenia: password.value
                })
            });

            const result = await response.json();

            if (result.success) {
                alert(`¡Bienvenido ${result.user.nombre}!`);
                
                // redirigir a admin.html despues de 1 segundo
                setTimeout(() => {
                    window.location.href = '../html/admin.html';
                }, 1000);
                
            } else {
                alert("Error: " + result.message);
            }
        } catch (error) {
            console.error('Error:', error);
            alert("Error de conexión. Intenta nuevamente.");
        }
    }
});

    
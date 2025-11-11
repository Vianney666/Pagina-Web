
const togglePass1 = document.getElementById('togglePass1');
    const togglePass2 = document.getElementById('togglePass2');
    const pass1 = document.getElementById('password');
    const pass2 = document.getElementById('confirmar');

    togglePass1.addEventListener('click', () => {
      pass1.type = pass1.type === 'password' ? 'text' :'password';
    });
    togglePass2.addEventListener('click', () => {
      pass2.type = pass2.type === 'password'?'text' : 'password';
    });

    const usuario = document.getElementById('usuario');
    const correo = document.getElementById('correo');
    const password = document.getElementById('password');
    const confirmar = document.getElementById('confirmar');

    const usuarioError = document.getElementById('usuario-error');
    const correoError = document.getElementById('correo-error');
    const passwordError = document.getElementById('password-error');
    const confirmarError = document.getElementById('confirmar-error');

    usuario.addEventListener('input', () => {
      usuarioError.style.display = usuario.value.trim() ? 'none' :'block';
    });

    correo.addEventListener('input', () => {
      const correoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.value);
      correoError.style.display = correoValido ? 'none' : 'block';
    });

    password.addEventListener('input', () => {
      passwordError.style.display = password.value.trim() ? 'none': 'block';
    });

    confirmar.addEventListener('input', () => {
      confirmarError.style.display = (confirmar.value === password.value) ? 'none' : 'block';
    });

    const form = document.getElementById('registroForm');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let valido = true;

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

      if (valido) {
        alert("Registro exitoso");
      }
    });
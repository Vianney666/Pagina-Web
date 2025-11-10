
const togglePassword = document.getElementById('togglePassword');
    const password = document.getElementById('password');
    togglePassword.addEventListener('click', () => {
      password.type = password.type === 'password' ? 'text' : 'password';
    });

    const usuario = document.getElementById('usuario');
    const usuarioError = document.getElementById('usuario-error');
    const passwordError = document.getElementById('password-error');

    usuario.addEventListener('input', () => {
      usuarioError.style.display = usuario.value.trim() ? 'none': 'block';
    });

    password.addEventListener('input', () => {
      passwordError.style.display = password.value.trim() ? 'none' : 'block';
    });

    const form = document.getElementById('loginForm');
    form.addEventListener('submit', (e) => {
      if (!usuario.value.trim() || !password.value.trim()) {
        e.preventDefault();
        usuarioError.style.display = !usuario.value.trim() ? 'block':'none';
        passwordError.style.display = !password.value.trim() ?'block' : 'none';
      } else {
        <a href="tabla_de_partidos.html" class="btn-login"></a>
      }
    });
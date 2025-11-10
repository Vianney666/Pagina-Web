
const abrirMenu = document.getElementById('abrirMenu');
        const sideMenu = document.getElementById('sideMenu');
        abrirMenu.addEventListener('click', () => {
            sideMenu.classList.toggle('active');
        });
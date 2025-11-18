
const abrirMenu = document.getElementById('abrirMenu');
        const sideMenu = document.getElementById('sideMenu');
        abrirMenu.addEventListener('click', () => {
            sideMenu.classList.toggle('active');
        });

        // Función para mostrar el día seleccionado
function mostrarDia(diaId) {
    // Ocultar todas las tablas
    const todasLasTablas = document.querySelectorAll('.tabla_de_juegos');
    todasLasTablas.forEach(tabla => {
        tabla.style.display = 'none';
    });
    
    // Mostrar la tabla seleccionada
    const tablaSeleccionada = document.getElementById('tabla-' + diaId);
    if (tablaSeleccionada) {
        tablaSeleccionada.style.display = 'flex';
    }
    
    // Quitar clase active de todos los tabs
    const todosLosTabs = document.querySelectorAll('.tab-dia');
    todosLosTabs.forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Agregar clase active al tab seleccionado
    const tabSeleccionado = document.querySelector(`[data-dia="${diaId}"]`);
    if (tabSeleccionado) {
        tabSeleccionado.classList.add('active');
    }
}

// Inicialización cuando carga la página
document.addEventListener('DOMContentLoaded', function() {
    // Mostrar por defecto el primer día
    mostrarDia('dia1');
});
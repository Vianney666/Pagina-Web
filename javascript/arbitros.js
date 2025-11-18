// arreglo estatico
let arbitros = [
    {
        id: 1,
        nombre: "Juan Pablo Velazquez",
        telefono: "3332704683",
        correo: "vela@gmail.com",
        disponible: true
    }
];

let editandoId = null;

// ==================== SERVICIO API ====================
const ArbitrosAPI = {
    // Obtener todos los árbitros
    async obtenerTodos() {
        try {
            const response = await fetch('php/arbitros_get.php');
            if (!response.ok) throw new Error('Error en la respuesta del servidor');
            return await response.json();
        } catch (error) {
            console.error('Error al obtener árbitros:', error);
            return [];
        }
    },

    // Crear nuevo árbitro
    async crear(arbitro) {
        try {
            const formData = new FormData();
            formData.append('nombre', arbitro.nombre);
            formData.append('telefono', arbitro.telefono);
            formData.append('correo', arbitro.correo);
            formData.append('disponible', arbitro.disponible ? 1 : 0);

            const response = await fetch('php/arbitros_post.php', {
                method: 'POST',
                body: formData
            });
            
            return await response.json();
        } catch (error) {
            console.error('Error al crear árbitro:', error);
            return { success: false, error: 'Error de conexión' };
        }
    },

    // Actualizar árbitro
    async actualizar(arbitro) {
        try {
            const formData = new FormData();
            formData.append('id', arbitro.id);
            formData.append('nombre', arbitro.nombre);
            formData.append('telefono', arbitro.telefono);
            formData.append('correo', arbitro.correo);
            formData.append('disponible', arbitro.disponible ? 1 : 0);

            const response = await fetch('php/arbitros_put.php', {
                method: 'POST',
                body: formData
            });
            
            return await response.json();
        } catch (error) {
            console.error('Error al actualizar árbitro:', error);
            return { success: false, error: 'Error de conexión' };
        }
    },

    // Eliminar árbitro
    async eliminar(id) {
        try {
            const formData = new FormData();
            formData.append('id', id);

            const response = await fetch('php/arbitros_delete.php', {
                method: 'POST',
                body: formData
            });
            
            return await response.json();
        } catch (error) {
            console.error('Error al eliminar árbitro:', error);
            return { success: false, error: 'Error de conexión' };
        }
    }
};

// ==================== ELEMENTOS DEL DOM ====================
const form = document.getElementById('formArbitro');
const tabla = document.getElementById('cuerpoTabla');
const btnGuardar = document.getElementById('btnGuardar');
const btnCancelar = document.getElementById('btnCancelar');

// ==================== FUNCIONES PRINCIPALES ====================

// Función para cargar árbitros desde la API
async function cargarArbitrosDesdeAPI() {
    console.log('Cargando árbitros desde la API...');
    const arbitrosBD = await ArbitrosAPI.obtenerTodos();
    
    // Limpiar el array local y agregar los de la BD
    arbitros.length = 0;
    
    arbitrosBD.forEach(arbitroBD => {
        arbitros.push({
            id: arbitroBD.id,
            nombre: arbitroBD.nombre,
            telefono: arbitroBD.telefono,
            correo: arbitroBD.correo,
            disponible: arbitroBD.disponible === 1
        });
    });
    
    console.log(`Se cargaron ${arbitros.length} árbitros desde la BD`);
    actualizarTabla();
    mostrarArregloEnConsola();
}

// Función para mostrar mensajes al usuario
function mostrarMensaje(mensaje, tipo = 'success') {
    const mensajeDiv = document.getElementById('mensajeEstado');
    mensajeDiv.textContent = mensaje;
    mensajeDiv.className = `mensaje-estado ${tipo}`;
    mensajeDiv.style.display = 'block';
    
    setTimeout(() => {
        mensajeDiv.style.display = 'none';
    }, 3000);
}

// Función para cancelar edición
function cancelarEdicion() {
    editandoId = null;
    btnGuardar.textContent = 'Guardar';
    btnCancelar.style.display = 'none';
    form.reset();
    mostrarMensaje('Edición cancelada', 'info');
}

// Función para mostrar datos en consola
function mostrarArregloEnConsola() {
    console.log('         Árbitros registrados \n');
    console.log(`Árbitros en el sistema: ${arbitros.length}`);
    console.log(`Disponibles: ${arbitros.filter(a => a.disponible).length}`);
    console.log(`No disponibles: ${arbitros.filter(a => !a.disponible).length}`);
    console.log('-----------------------------------------');

    arbitros.forEach((arbitro, index) => {
        console.log(`${index + 1}. ${arbitro.nombre} | ${arbitro.telefono} | ${arbitro.correo} | ${arbitro.disponible ? ' Disponible' : 'No disponible'}`);
    });
}

// Función para actualizar la tabla HTML
function actualizarTabla() {
    tabla.innerHTML = '';

    arbitros.forEach(arbitro => {
        const fila = document.createElement('tr');

        fila.innerHTML = `
            <td>${arbitro.nombre}</td>
            <td>${arbitro.telefono}</td>
            <td>${arbitro.correo}</td>
            <td>
                <span class="${arbitro.disponible ? 'estado-disponible' : 'estado-no-disponible'}">
                    ${arbitro.disponible ? 'Disponible' : 'No disponible'}
                </span>
            </td>
            <td>
                <div class="acciones-container">
                    <button class="btn-accion btn-editar" onclick="editarArbitro(${arbitro.id})">
                        Editar
                    </button>
                    <button class="btn-accion btn-eliminar" onclick="eliminarArbitro(${arbitro.id})">
                        Eliminar
                    </button>
                </div>
            </td>
        `;

        tabla.appendChild(fila);
    });
}

// Función para editar árbitro
function editarArbitro(id) {
    const arbitro = arbitros.find(a => a.id === id);

    if (arbitro) {
        document.getElementById('nombreArbitro').value = arbitro.nombre;
        document.getElementById('telefonoArbitro').value = arbitro.telefono;
        document.getElementById('correoArbitro').value = arbitro.correo;
        document.getElementById('estadoArbitro').value = arbitro.disponible.toString();

        editandoId = id;
        btnGuardar.textContent = 'Actualizar';
        btnCancelar.style.display = 'inline-block';
        
        mostrarMensaje('Editando árbitro: ' + arbitro.nombre, 'info');
    }
}

// Función para eliminar árbitro
async function eliminarArbitro(id) {
    const arbitro = arbitros.find(a => a.id === id);
    if (arbitro && confirm('¿Estás seguro de que quieres eliminar al árbitro ' + arbitro.nombre + '?')) {
        
        // Eliminar de la base de datos
        const resultado = await ArbitrosAPI.eliminar(id);
        
        if (resultado.success) {
            // Eliminar del array local
            arbitros = arbitros.filter(arbitro => arbitro.id !== id);
            actualizarTabla();
            mostrarArregloEnConsola();
            mostrarMensaje('Árbitro eliminado correctamente');
        } else {
            mostrarMensaje('Error al eliminar: ' + resultado.error, 'error');
        }
    }
}

// ==================== EVENT LISTENERS ====================

// Evento para el botón cancelar
btnCancelar.addEventListener('click', cancelarEdicion);

// Evento para el formulario
form.addEventListener('submit', async function (event) {
    event.preventDefault();

    const arbitroData = {
        nombre: document.getElementById('nombreArbitro').value,
        telefono: document.getElementById('telefonoArbitro').value,
        correo: document.getElementById('correoArbitro').value,
        disponible: document.getElementById('estadoArbitro').value === 'true'
    };

    let resultado;

    if (editandoId) {
        // MODO EDICIÓN - Actualizar
        arbitroData.id = editandoId;
        resultado = await ArbitrosAPI.actualizar(arbitroData);
        
        if (resultado.success) {
            // Actualizar en el array local
            const index = arbitros.findIndex(arbitro => arbitro.id === editandoId);
            arbitros[index] = { ...arbitroData, id: editandoId };
            
            mostrarMensaje('Árbitro actualizado correctamente');
            editandoId = null;
            btnGuardar.textContent = 'Guardar';
            btnCancelar.style.display = 'none';
        } else {
            mostrarMensaje('Error al actualizar: ' + resultado.error, 'error');
            return;
        }
    } else {
        // MODO CREACIÓN - Guardar nuevo
        resultado = await ArbitrosAPI.crear(arbitroData);
        
        if (resultado.success) {
            // Recargar todos los datos desde la API para obtener el ID real
            await cargarArbitrosDesdeAPI();
            mostrarMensaje('Árbitro guardado correctamente');
        } else {
            mostrarMensaje('Error al guardar: ' + resultado.error, 'error');
            return;
        }
    }

    actualizarTabla();
    mostrarArregloEnConsola();
    form.reset();
});

// ==================== INICIALIZACIÓN ====================

// Al cargar la página
document.addEventListener('DOMContentLoaded', async function () {
    // Cargar datos desde la API al iniciar
    await cargarArbitrosDesdeAPI();
});


















































/* arreglo estatico
let arbitros = [
    {
        id: 1,
        nombre: "Juan Pablo Velazquez",
        telefono: "3332704683",
        correo: "vela@gmail.com",
        disponible: true
    }
];

let editandoId = null;

// feedback a usuario
function mostrarMensaje(mensaje, tipo = 'success') {
    const mensajeDiv = document.getElementById('mensajeEstado');
    mensajeDiv.textContent = mensaje;
    mensajeDiv.className = `mensaje-estado ${tipo}`;
    mensajeDiv.style.display = 'block';
    
    setTimeout(() => {
        mensajeDiv.style.display = 'none';
    }, 3000);
}


function cancelarEdicion() {
    editandoId = null;
    document.getElementById('btnGuardar').textContent = 'Guardar';
    document.getElementById('btnCancelar').style.display = 'none';
    document.getElementById('formArbitro').reset();
    mostrarMensaje('Edición cancelada', 'info');
}

function mostrarArregloEnConsola() {
    console.log('         Árbitros registrados \n');
    console.log(`Árbitros en el sistema: ${arbitros.length}`);
    console.log(`Disponibles: ${arbitros.filter(a => a.disponible).length}`);
    console.log(`No disponibles: ${arbitros.filter(a => !a.disponible).length}`);
    console.log('-----------------------------------------');

    arbitros.forEach((arbitro, index) => {
        console.log(`${index + 1}. ${arbitro.nombre} | ${arbitro.telefono} | ${arbitro.correo} | 
        ${arbitro.disponible ? ' Disponible' : 'No disponible'}`);
    });
}

//busqueda al html con su id
const form = document.getElementById('formArbitro');
const tabla = document.getElementById('cuerpoTabla');
const btnGuardar = document.getElementById('btnGuardar');
const btnCancelar = document.getElementById('btnCancelar');

//boton integrado cancelar
btnCancelar.addEventListener('click', cancelarEdicion);

form.addEventListener('submit', function (event) {
    event.preventDefault();

    const nuevoArbitro = {
        id: editandoId || Date.now(),
        nombre: document.getElementById('nombreArbitro').value,
        telefono: document.getElementById('telefonoArbitro').value,
        correo: document.getElementById('correoArbitro').value,
        disponible: document.getElementById('estadoArbitro').value === 'true'
    };

    if (editandoId) {
        const index = arbitros.findIndex(arbitro => arbitro.id === editandoId);
        arbitros[index] = nuevoArbitro;
        editandoId = null;
        btnGuardar.textContent = 'Guardar';
        btnCancelar.style.display = 'none';
        mostrarMensaje('Árbitro actualizado correctamente');
    } else {
        arbitros.push(nuevoArbitro);
        mostrarMensaje('Árbitro guardado correctamente');
    }

    actualizarTabla();
    mostrarArregloEnConsola();
    form.reset();
});

function actualizarTabla() {
    tabla.innerHTML = '';

    arbitros.forEach(arbitro => {
        const fila = document.createElement('tr');

        fila.innerHTML = `
            <td>${arbitro.nombre}</td>
            <td>${arbitro.telefono}</td>
            <td>${arbitro.correo}</td>
            <td>
                <span class="${arbitro.disponible ? 'estado-disponible' : 'estado-no-disponible'}">
                    ${arbitro.disponible ? 'Disponible' : 'No disponible'}
                </span>
            </td>
            <td>
                <div class="acciones-container">
                    <button class="btn-accion btn-editar" onclick="editarArbitro(${arbitro.id})">
                        Editar
                    </button>
                    <button class="btn-accion btn-eliminar" onclick="eliminarArbitro(${arbitro.id})">
                        Eliminar
                    </button>
                </div>
            </td>
        `;

        tabla.appendChild(fila);
    });
}

function editarArbitro(id) {
    const arbitro = arbitros.find(a => a.id === id);

    if (arbitro) {
        document.getElementById('nombreArbitro').value = arbitro.nombre;
        document.getElementById('telefonoArbitro').value = arbitro.telefono;
        document.getElementById('correoArbitro').value = arbitro.correo;
        document.getElementById('estadoArbitro').value = arbitro.disponible.toString();

        editandoId = id;
        btnGuardar.textContent = 'Actualizar';
        btnCancelar.style.display = 'inline-block';
        
        mostrarMensaje('Editando árbitro: ' + arbitro.nombre, 'info');
    }
}

function eliminarArbitro(id) {
    const arbitro = arbitros.find(a => a.id === id);
    if (arbitro && confirm('¿Estás seguro de que quieres eliminar al árbitro ' + arbitro.nombre + '?')) {
        arbitros = arbitros.filter(arbitro => arbitro.id !== id);
        actualizarTabla();
        mostrarArregloEnConsola();
        mostrarMensaje('Árbitro eliminado correctamente');
    }
}

document.addEventListener('DOMContentLoaded', function () {
    actualizarTabla();
    mostrarArregloEnConsola();
}); */
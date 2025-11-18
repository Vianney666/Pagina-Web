
async function obtenerTodos() {
    try {
        const timestamp = new Date().getTime();
        const respuesta = await fetch(`../php/arbitros_get.php?t=${timestamp}`);

        if (!respuesta.ok) {
            throw new Error('Error en la respuesta del servidor');
        }
        const arbitros = await respuesta.json();

        return arbitros.map(arbitro => ({
            ...arbitro,
            id: Number(arbitro.id)
        }));

    } catch (error) {
        console.error('Error al obtener árbitros:', error);
        throw error;
    }
}


async function crearArbitro(arbitro) {
    try {
        const respuesta = await fetch('../php/arbitros_post.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(arbitro)
        });

        if (!respuesta.ok) {
            throw new Error('Error en la respuesta del servidor');
        }

        const resultado = await respuesta.json();
        return resultado;
    } catch (error) {
        console.error('Error al crear árbitro:', error);
        throw error;
    }
}


async function actualizarArbitro(id, arbitro) {
    try {
        const respuesta = await fetch('../php/arbitros_put.php', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id, ...arbitro })
        });

        if (!respuesta.ok) {
            throw new Error('Error en la respuesta del servidor');
        }

        const resultado = await respuesta.json();
        return resultado;

    } catch (error) {
        console.error('Error al actualizar árbitro:', error);
        throw error;
    }
}


async function eliminarArbitro(id) {
    try {
        const respuesta = await fetch('../php/arbitros_delete.php', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id })
        });

        if (!respuesta.ok) {
            throw new Error('Error en la respuesta del servidor');
        }

        const resultado = await respuesta.json();
        return resultado;
    } catch (error) {
        console.error('Error al eliminar árbitro:', error);
        throw error;
    }
}

async function cargarArbitrosDesdeAPI() {
    try {
        const arbitros = await obtenerTodos();
        return arbitros;
    } catch (error) {
        console.error('Error al cargar árbitros:', error);
        return [];
    }
}

// variabes globales
let arbitros = [];
let editandoId = null;

// cargar arbitros en la tabla
function mostrarArbitros(arbitros) {
    const tbody = document.getElementById('cuerpoTabla');
    tbody.innerHTML = '';

    if (arbitros.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No hay árbitros registrados</td></tr>';
        return;
    }

    arbitros.forEach(arbitro => {
        const tr = document.createElement('tr');

        tr.innerHTML = `
            <td>${arbitro.nombre}</td>
            <td>${arbitro.telefono}</td>
            <td>${arbitro.email}</td>
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
                    <button class="btn-accion btn-eliminar" onclick="eliminarArbitroConfirm(${arbitro.id})">
                        Eliminar
                    </button>
                </div>
            </td>
        `;

        tbody.appendChild(tr);
    });
}

// arreglo de arbitros
function mostrarArregloEnConsola() {
    console.log('Arbitros');
    console.log('Registrados:', arbitros.length);
    console.log('Disponibles:', arbitros.filter(a => a.disponible).length);
    console.log('No disponibles:', arbitros.filter(a => !a.disponible).length);
    console.log('----------------------------------------');
    console.log('Informacion');
    arbitros.forEach((arbitro, index) => {
        console.log(`${index + 1}. ID: ${arbitro.id} | ${arbitro.nombre} | ${arbitro.telefono} |
             ${arbitro.email} | ${arbitro.disponible ? 'Disponible' : 'No disponible'}`);
    });
}


function limpiarFormulario() {
    document.getElementById('formArbitro').reset();
    editandoId = null;
    document.getElementById('btnGuardar').textContent = 'Guardar';
    document.getElementById('btnCancelar').style.display = 'none';
    document.getElementById('mensajeEstado').style.display = 'none';
}

function cancelarEdicion() {
    limpiarFormulario();
    mostrarMensaje('Edición cancelada', 'info');
}


function mostrarMensaje(mensaje, tipo = 'exito') {
    const mensajeDiv = document.getElementById('mensajeEstado');
    mensajeDiv.textContent = mensaje;
    mensajeDiv.className = `mensaje-estado ${tipo}`;
    mensajeDiv.style.display = 'block';

    setTimeout(() => {
        mensajeDiv.style.display = 'none';
    }, 3000);
}


function editarArbitro(id) {
    try {
        const idNumero = Number(id);
        const arbitro = arbitros.find(a => a.id === idNumero);

        if (arbitro) {
            document.getElementById('nombreArbitro').value = arbitro.nombre;
            document.getElementById('telefonoArbitro').value = arbitro.telefono;
            document.getElementById('correoArbitro').value = arbitro.email;
            document.getElementById('estadoArbitro').value = arbitro.disponible ? 'true' : 'false';

            editandoId = idNumero;
            document.getElementById('btnGuardar').textContent = 'Actualizar';
            document.getElementById('btnCancelar').style.display = 'inline-block';

            mostrarMensaje('Editando árbitro: ' + arbitro.nombre, 'info');
        }
    } catch (error) {
        console.error('Error al editar árbitro:', error);
        mostrarMensaje('Error al cargar datos del árbitro', 'error');
    }
}

// pregunta antes de eliminar 
function eliminarArbitroConfirm(id) {
    const idNumero = Number(id);
    const arbitro = arbitros.find(a => a.id === idNumero);

    if (arbitro && confirm('¿Estás seguro de que quieres eliminar al arbitro ' + arbitro.nombre + '?')) {
        eliminarArbitroAsync(idNumero);
    }
}

// desp de confrmacion
async function eliminarArbitroAsync(id) {
    try {
        await eliminarArbitro(id);
        arbitros = await cargarArbitrosDesdeAPI();
        mostrarArbitros(arbitros);
        mostrarArregloEnConsola();
        mostrarMensaje('Árbitro eliminado correctamente', 'exito');
    } catch (error) {
        console.error('Error al eliminar árbitro:', error);
        mostrarMensaje('Error al eliminar árbitro', 'error');
    }
}

// validaciones
document.getElementById('formArbitro').addEventListener('submit', async function (e) {
    e.preventDefault();

    const arbitro = {
        nombre: document.getElementById('nombreArbitro').value.trim(),
        telefono: document.getElementById('telefonoArbitro').value.trim(),
        email: document.getElementById('correoArbitro').value.trim(),
        disponible: document.getElementById('estadoArbitro').value === 'true'
    };

    if (!arbitro.nombre || !arbitro.telefono || !arbitro.email) {
        mostrarMensaje('Por favor completa todos los campos', 'error');
        return;
    }

    try {
        if (editandoId) {
            await actualizarArbitro(editandoId, arbitro);
            mostrarMensaje('Árbitro actualizado correctamente', 'exito');
        } else {
            await crearArbitro(arbitro);
            mostrarMensaje('Árbitro creado correctamente', 'exito');
        }

        arbitros = await cargarArbitrosDesdeAPI();
        mostrarArbitros(arbitros);
        mostrarArregloEnConsola();
        limpiarFormulario();

    } catch (error) {
        console.error('Error al guardar árbitro:', error);
        mostrarMensaje('Error al guardar árbitro: ' + error.message, 'error');
    }
});


document.getElementById('btnCancelar').addEventListener('click', function () {
    cancelarEdicion();
});


document.addEventListener('DOMContentLoaded', async function () {
    try {
        arbitros = await cargarArbitrosDesdeAPI();
        mostrarArbitros(arbitros);
        mostrarArregloEnConsola();
    } catch (error) {
        console.error('Error al cargar los árbitros:', error);
        mostrarMensaje('Error al cargar los árbitros', 'error');
    }
});


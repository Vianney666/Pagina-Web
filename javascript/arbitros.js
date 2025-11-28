// vars globales
let arbitros = [];
let arbitrosDesactivados = [];
let editandoId = null;
let mostrandoDesactivados = false;


//api
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
        const arbitrosData = await obtenerTodos();
        //Solo mostrar arbitros con estado 1 (activos)
        const arbitrosActivos = arbitrosData.filter(arbitro => Number(arbitro.estado) === 1);
        mostrarArregloEnConsola(arbitrosActivos);
        return arbitrosActivos;
    } catch (error) {
        console.error('Error al cargar árbitros:', error);
        return [];
    }
}

async function cargarArbitrosDesactivados() {
    try {
        const response = await fetch('../php/arbitros_desactivados.php');

        if (!response.ok) {
            throw new Error('Error al cargar árbitros desactivados');
        }

        arbitrosDesactivados = await response.json();
        arbitrosDesactivados.forEach(arbitro => {
            arbitro.id = Number(arbitro.id);
        });

    } catch (error) {
        console.error('Error cargando árbitros desactivados:', error);
        arbitrosDesactivados = [];
    }
}


function calcularArbitros(arbitrosArray) {
    const total = arbitrosArray.length;
    const disponibles = arbitrosArray.filter(a => Number(a.disponible) === 1).length;
    const noDisponibles = arbitrosArray.filter(a => Number(a.disponible) === 0).length;

    return {
        total: total,
        disponibles: disponibles,
        noDisponibles: noDisponibles
    };
}

function mostrarArregloEnConsola(arbitrosArray) {
    const stats = calcularArbitros(arbitrosArray);

    console.log('Arbitros');
    console.log('Registrados: ' + stats.total);
    console.log('Disponibles: ' + stats.disponibles);
    console.log('No disponibles: ' + stats.noDisponibles);
    console.log('--------------------------');
    console.log('Informacion');

    arbitrosArray.forEach((arbitro, index) => {
        const estado = Number(arbitro.disponible) === 1 ? 'Disponible' : 'No disponible';
        console.log(`${index + 1}. ID: ${arbitro.id} | ${arbitro.nombre} |
             ${arbitro.telefono} | ${arbitro.email} | ${estado}`);
    });
}


//funciones de la tabla
function mostrarArbitros(arbitrosArray) {
    const tbody = document.getElementById('cuerpoTabla');
    tbody.innerHTML = '';

    if (arbitrosArray.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No hay árbitros registrados</td></tr>';
        return;
    }

    arbitrosArray.forEach(arbitro => {
        const tr = document.createElement('tr');

        const estaDisponible = Number(arbitro.disponible) === 1;
        const claseEstado = estaDisponible ? 'estado-disponible' : 'estado-no-disponible';
        const textoEstado = estaDisponible ? 'Disponible' : 'No disponible';

        tr.innerHTML = `
            <td>${arbitro.nombre}</td>
            <td>${arbitro.telefono}</td>
            <td>${arbitro.email}</td>
            <td>
                <span class="${claseEstado}">
                    ${textoEstado}
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

function mostrarArbitrosDesactivados() {
    const tbody = document.getElementById('cuerpoTabla');

    if (arbitrosDesactivados.length === 0) {
        tbody.innerHTML = '<tr class="arbitro-desactivado"><td colspan="5" style="text-align: center; color: #888; font-style: italic;">No hay árbitros eliminados</td></tr>';
        return;
    }

    tbody.innerHTML = arbitrosDesactivados.map(arbitro => `
        <tr class="arbitro-desactivado">
            <td>${arbitro.nombre}</td>
            <td>${arbitro.telefono}</td>
            <td>${arbitro.email}</td>
            <td>
                <span class="estado-no-disponible">
                    Eliminado
                </span>
            </td>
            <td>
                <div class="acciones-container">
                    <button class="btn-accion btn-activar" onclick="restaurarArbitro(${arbitro.id})">
                        Recuperar
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}


//papelera
async function alternarVistaArbitros() {
    mostrandoDesactivados = !mostrandoDesactivados;
    const btn = document.getElementById('btnAlternarVistaArbitros');

    if (mostrandoDesactivados) {
        await cargarArbitrosDesactivados();
        mostrarArbitrosDesactivados();
        btn.textContent = 'Volver';
    } else {
        await cargarArbitrosDesdeAPI();
        mostrarArbitros(arbitros);
        btn.textContent = 'Eliminado recientemente';
    }
    actualizarContadorArbitros();
}

async function restaurarArbitro(id) {
    const arbitroDesactivado = arbitrosDesactivados.find(a => a.id === id);

    if (!arbitroDesactivado) {
        alert('Árbitro no encontrado');
        return;
    }

    if (!confirm('¿Estás seguro de restaurar al árbitro ' + arbitroDesactivado.nombre + '?')) {
        return;
    }

    try {
        const response = await fetch('../php/arbitros_activar.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: id })
        });

        const resultado = await response.json();

        if (resultado.success) {
            arbitrosDesactivados = arbitrosDesactivados.filter(a => a.id !== id);
            arbitros = await cargarArbitrosDesdeAPI();

            if (mostrandoDesactivados) {
                mostrarArbitrosDesactivados();
            } else {
                mostrarArbitros(arbitros);
            }

            actualizarContadorArbitros();
            alert('Árbitro restaurado correctamente');
        } else {
            throw new Error(resultado.message);
        }

    } catch (error) {
        alert('Error: ' + error.message);
    }
}

function actualizarContadorArbitros() {
    const contador = document.getElementById('contadorDesactivados');
    const totalDesactivados = arbitrosDesactivados.length;

    if (totalDesactivados > 0) {
        contador.textContent = '(' + totalDesactivados + ' árbitro/s)';
    } else {
        contador.textContent = '';
    }
}


function limpiarFormulario() {
    document.getElementById('formArbitro').reset();
    editandoId = null;
    document.getElementById('btnGuardar').textContent = 'Guardar';
    document.getElementById('btnCancelar').style.display = 'none';
}

function cancelarEdicion() {
    limpiarFormulario();
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
        }
    } catch (error) {
        console.error('Error al editar árbitro:', error);
    }
}


function eliminarArbitroConfirm(id) {
    const idNumero = Number(id);
    const arbitro = arbitros.find(a => a.id === idNumero);

    if (arbitro && confirm('¿Estás seguro de que quieres eliminar al árbitro ' + arbitro.nombre + '?')) {
        eliminarArbitroAsync(idNumero);
    }
}

async function eliminarArbitroAsync(id) {
    try {
        const resultado = await eliminarArbitro(id);

        if (resultado.success) {
            arbitros = await cargarArbitrosDesdeAPI();
            await cargarArbitrosDesactivados();
            
            // Actualizar la vista inmediatamente
            mostrarArbitros(arbitros);
            actualizarContadorArbitros();
            alert('Árbitro eliminado correctamente');
        } else {
            throw new Error(resultado.message || 'Error al eliminar árbitro');
        }

    } catch (error) {
        alert('Error al eliminar árbitro: ' + error.message);
    }
}

// validaciones para el formulario
function configurarEventosFormulario() {
    const formArbitro = document.getElementById('formArbitro');
    if (formArbitro) {
        formArbitro.addEventListener('submit', manejarEnvioFormulario);
    }

    const btnCancelar = document.getElementById('btnCancelar');
    if (btnCancelar) {
        btnCancelar.addEventListener('click', cancelarEdicion);
    }
}

async function manejarEnvioFormulario(e) {
    e.preventDefault();

    const arbitroData = {
        nombre: document.getElementById('nombreArbitro').value.trim(),
        telefono: document.getElementById('telefonoArbitro').value.trim(),
        email: document.getElementById('correoArbitro').value.trim(),
        disponible: document.getElementById('estadoArbitro').value === 'true'
    };

    if (!arbitroData.nombre || !arbitroData.telefono || !arbitroData.email) {
        alert('Por favor completa todos los campos');
        return;
    }

    try {
        let resultado;
        if (editandoId) {
            resultado = await actualizarArbitro(editandoId, arbitroData);
            if (resultado.success) {
                alert('Información actualizada correctamente');
            } else {
                throw new Error(resultado.message || 'Error al actualizar información');
            }
        } else {
            resultado = await crearArbitro(arbitroData);
            if (resultado.success) {
                alert('Árbitro creado correctamente');
            } else {
                throw new Error(resultado.message || 'Error al crear árbitro');
            }
        }

        arbitros = await cargarArbitrosDesdeAPI();
        await cargarArbitrosDesactivados();

        if (mostrandoDesactivados) {
            mostrarArbitrosDesactivados();
        } else {
            mostrarArbitros(arbitros);
        }

        actualizarContadorArbitros();
        limpiarFormulario();

    } catch (error) {
        alert('Error al guardar árbitro: ' + error.message);
    }
}


function configurarEventosArbitros() {
    const btnAlternar = document.getElementById('btnAlternarVistaArbitros');
    if (btnAlternar) {
        btnAlternar.addEventListener('click', alternarVistaArbitros);
    }
    configurarEventosFormulario();
}


async function inicializarArbitros() {
    try {
        arbitros = await cargarArbitrosDesdeAPI();
        await cargarArbitrosDesactivados();
        mostrarArbitros(arbitros);
        configurarEventosArbitros();
        actualizarContadorArbitros();

    } catch (error) {
        console.error('Error al inicializar árbitros:', error);
        alert('Error al cargar los árbitros: ' + error.message);
    }
}

document.addEventListener('DOMContentLoaded', function () {
    inicializarArbitros();
});



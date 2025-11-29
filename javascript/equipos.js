// Lista simplemente enlazada para equipos desactivados
class NodoEquipo {
    constructor(equipo) {
        this.datos = equipo;
        this.siguiente = null;
    }
}

class ListaEquiposDesactivados {
    constructor() {
        this.cabeza = null;
        this.tamanio = 0;
    }

    insertar(equipo) {
        const nuevoNodo = new NodoEquipo(equipo);
        nuevoNodo.siguiente = this.cabeza;
        this.cabeza = nuevoNodo;
        this.tamanio++;
    }

    mostrar() {
        const equipos = [];
        let actual = this.cabeza;

        while (actual !== null) {
            equipos.push(actual.datos);
            actual = actual.siguiente;
        }

        return equipos;
    }

    buscarPorId(id) {
        let actual = this.cabeza;

        while (actual !== null) {
            if (Number(actual.datos.id) === Number(id)) {
                return { equipo: actual.datos };
            }
            actual = actual.siguiente;
        }

        return null;
    }

    contar() {
        return this.tamanio;
    }
}


// var globales
let equipos = [];
let nombresEquipos = [];
const API_BASE = '../php/equipos';
let equipoEditando = null;
const listaDesactivados = new ListaEquiposDesactivados();
let mostrandoDesactivados = false;


function actualizarVista() {
    if (mostrandoDesactivados) {
        mostrarEquiposDesactivados();
    } else {
        mostrarEquipos(equipos);
    }
    actualizarContador();
}

async function recargarDatos() {
    await cargarEquipos();
    await cargarEquiposEliminados();
    actualizarVista();
}


// filtro de busquedas
function configurarFiltroBusqueda() {
    const inputBusqueda = document.getElementById('inputBusquedaEquipos');

    if (!inputBusqueda) return;

    inputBusqueda.addEventListener('input', function (e) {
        const termino = e.target.value.toLowerCase().trim();
        aplicarFiltroBusqueda(termino);
    });

    // limpiar filtro al cambiar vista
    const btnAlternar = document.getElementById('btnAlternarVista');
    if (btnAlternar) {
        btnAlternar.addEventListener('click', function () {
            setTimeout(() => {
                inputBusqueda.value = '';
                aplicarFiltroBusqueda('');
            }, 100);
        });
    }
}

function aplicarFiltroBusqueda(termino) {
    const equiposAFiltrar = mostrandoDesactivados ? listaDesactivados.mostrar() : equipos;

    if (!termino) {
        actualizarVista();
        actualizarContadorResultados(equiposAFiltrar.length, equiposAFiltrar.length);
        return;
    }

    const resultados = equiposAFiltrar.filter(equipo =>
        equipo.nombre.toLowerCase().includes(termino) ||
        equipo.representante.toLowerCase().includes(termino) ||
        equipo.telefono.includes(termino)
    );

    mostrarResultadosFiltrados(resultados, termino);
    actualizarContadorResultados(resultados.length, equiposAFiltrar.length, termino);
}

function mostrarResultadosFiltrados(equiposFiltrados, terminoBusqueda) {
    const tbody = document.getElementById('tablaEquipos');

    if (!tbody) return;

    if (equiposFiltrados.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4">
                    <div class="mensaje-no-resultados">
                        <h3>No se encontraron resultados</h3>
                        <p>No hay equipos que coincidan con "<strong>${terminoBusqueda}</strong>"</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    const esVistaDesactivados = mostrandoDesactivados;

    tbody.innerHTML = equiposFiltrados.map(equipo => {
        if (esVistaDesactivados) {
            return `
                <tr class="equipo-desactivado">
                    <td>${resaltarCoincidencia(equipo.nombre, terminoBusqueda)}</td>
                    <td>${resaltarCoincidencia(equipo.representante, terminoBusqueda)}</td>
                    <td>${resaltarCoincidencia(equipo.telefono, terminoBusqueda)}</td>
                    <td class="celda-acciones">
                        <button class="btn-accion btn-activar" onclick="restaurarEquipo(${equipo.id})">
                            Recuperar
                        </button>
                    </td>
                </tr>
            `;
        } else {
            return `
                <tr>
                    <td>${resaltarCoincidencia(equipo.nombre, terminoBusqueda)}</td>
                    <td>${resaltarCoincidencia(equipo.representante, terminoBusqueda)}</td>
                    <td>${resaltarCoincidencia(equipo.telefono, terminoBusqueda)}</td>
                    <td class="celda-acciones">
                        <button class="btn-accion btn-editar" onclick="editarEquipo(${equipo.id})">Editar</button>
                        <button class="btn-accion btn-eliminar" onclick="eliminarEquipo(${equipo.id})">Eliminar</button>
                    </td>
                </tr>
            `;
        }
    }).join('');
}

function resaltarCoincidencia(texto, terminoBusqueda) {
    if (!terminoBusqueda || !texto) return texto;

    const textoStr = texto.toString();
    const regex = new RegExp(`(${terminoBusqueda.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return textoStr.replace(regex, '<mark>$1</mark>');
}

function actualizarContadorResultados(encontrados, total, termino = '') {
    const contador = document.getElementById('contadorResultadosEquipos');

    if (!contador) return;

    if (!termino) {
        contador.textContent = `Mostrando ${total} equipo${total !== 1 ? 's' : ''}`;
        contador.style.color = '#3A5A40';
    } else if (encontrados === 0) {
        contador.textContent = '';
    } else {
        contador.textContent = `Encontrado${encontrados !== 1 ? 's' : ''} ${encontrados} 
        de ${total} equipo${total !== 1 ? 's' : ''}`;
        contador.style.color = '#2d5016';
    }
}


// funciones principales
async function alternarVista() {
    mostrandoDesactivados = !mostrandoDesactivados;
    const btn = document.getElementById('btnAlternarVista');

    if (mostrandoDesactivados) {
        btn.textContent = 'Volver';
    } else {
        btn.textContent = 'Eliminado recientemente';
    }

    await recargarDatos();
}


function mostrarEquipos(equiposArray) {
    const tbody = document.getElementById('tablaEquipos');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (equiposArray.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: #454444;">No hay equipos registrados</td></tr>';
        actualizarContadorResultados(0, 0);
        return;
    }

    tbody.innerHTML = equiposArray.map(equipo => `
        <tr>
            <td>${equipo.nombre}</td>
            <td>${equipo.representante}</td>
            <td>${equipo.telefono}</td>
            <td class="celda-acciones">
                <button class="btn-accion btn-editar" onclick="editarEquipo(${equipo.id})">Editar</button>
                <button class="btn-accion btn-eliminar" onclick="eliminarEquipo(${equipo.id})">Eliminar</button>
            </td>
        </tr>
    `).join('');

    actualizarContadorResultados(equiposArray.length, equiposArray.length);
}

function mostrarEquiposDesactivados() {
    const equiposDesactivados = listaDesactivados.mostrar();
    const tbody = document.getElementById('tablaEquipos');

    if (equiposDesactivados.length === 0) {
        tbody.innerHTML = '<tr class="equipo-desactivado"><td colspan="4" style="text-align: center; color: #888; font-style: italic;">No hay equipos eliminados</td></tr>';
        actualizarContadorResultados(0, 0);
        return;
    }

    tbody.innerHTML = equiposDesactivados.map(equipo => `
        <tr class="equipo-desactivado">
            <td>${equipo.nombre}</td>
            <td>${equipo.representante}</td>
            <td>${equipo.telefono}</td>
            <td class="celda-acciones">
                <button class="btn-accion btn-activar" onclick="restaurarEquipo(${equipo.id})">
                    Recuperar
                </button>
            </td>
        </tr>
    `).join('');

    actualizarContadorResultados(equiposDesactivados.length, equiposDesactivados.length);
}


async function eliminarEquipo(id) {
    const equipo = equipos.find(e => e.id === id);
    if (!equipo) {
        mostrarMensaje('Equipo no encontrado');
        return;
    }

    if (!confirm('¿Estas seguro de eliminar al equipo ' + equipo.nombre + '?')) {
        return;
    }

    try {
        const formData = new FormData();
        formData.append('id', id);

        const response = await fetch(API_BASE + '_delete.php', {
            method: 'POST',
            body: formData
        });

        const resultado = await response.json();

        if (!response.ok || !resultado.success) {
            mostrarMensaje(resultado.message || 'No se pudo eliminar el equipo');
            return;
        }
        await recargarDatos();
        mostrarMensaje('Equipo eliminado correctamente');

    } catch (error) {
        mostrarMensaje('Error: ' + error.message);
    }
}


async function restaurarEquipo(id) {
    const equipoDesactivado = listaDesactivados.buscarPorId(id);

    if (!equipoDesactivado) {
        mostrarMensaje('Equipo no encontrado');
        return;
    }

    if (!confirm('¿Estas seguro de recuperar al equipo ' + equipoDesactivado.equipo.nombre + '?')) {
        return;
    }

    try {
        const formData = new FormData();
        formData.append('id', id);
        formData.append('estado', 1);

        const response = await fetch('../php/equipos_activar.php', {
            method: 'POST',
            body: formData
        });

        const resultado = await response.json();

        if (!response.ok || !resultado.success) {
            throw new Error(resultado.message || 'Error al restaurar el equipo');
        }

        await recargarDatos();
        mostrarMensaje('Equipo restaurado correctamente');

    } catch (error) {
        mostrarMensaje('Error: ' + error.message);
    }
}


function actualizarContador() {
    const contador = document.getElementById('contadorDesactivados');
    const totalDesactivados = listaDesactivados.contar();

    if (totalDesactivados > 0) {
        contador.textContent = '(' + totalDesactivados + ' equipo/s)';
    } else {
        contador.textContent = '';
    }
}


async function cargarEquiposEliminados() {
    try {
        const response = await fetch('../php/equipos_desactivados.php');

        if (!response.ok) {
            throw new Error('Error al mostrar información');
        }

        const equiposDesactivados = await response.json();

        listaDesactivados.cabeza = null;
        listaDesactivados.tamanio = 0;

        equiposDesactivados.reverse().forEach(equipo => {
            equipo.id = Number(equipo.id);
            listaDesactivados.insertar(equipo);
        });

    } catch (error) {
        console.error('Error cargando equipos desactivados:', error);
    }
}


async function inicializarEquipos() {
    try {
        await recargarDatos();
        configurarEventos();
        configurarFiltroBusqueda();
        actualizarContadorResultados(equipos.length, equipos.length);

    } catch (error) {
        console.error('Error al inicializar equipos:', error);
        mostrarMensaje('Error al cargar los datos: ' + error.message);
    }
}


function configurarEventos() {
    const formEquipo = document.getElementById('formEquipo');
    if (formEquipo) {
        formEquipo.addEventListener('submit', manejarEnvioFormulario);
    }

    const btnAlternar = document.getElementById('btnAlternarVista');
    if (btnAlternar) {
        btnAlternar.addEventListener('click', alternarVista);
    }

    const btnCancelar = document.getElementById('btnCancelar');
    if (btnCancelar) {
        btnCancelar.addEventListener('click', cancelarEdicion);
    }
}


async function manejarEnvioFormulario(e) {
    e.preventDefault();

    const nombre = document.getElementById('nombreEquipo').value.trim();
    const representante = document.getElementById('representante').value.trim();
    const telefono = document.getElementById('telefono').value.trim();

    if (!validarTelefono(telefono)) {
        mostrarMensaje('El telefono debe tener al menos 7 digitos');
        return;
    }

    try {
        if (equipoEditando) {
            await actualizarEquipo(equipoEditando, nombre, representante, telefono);
        } else {
            await crearEquipo(nombre, representante, telefono);
        }

        limpiarFormulario();
        await recargarDatos();

    } catch (error) {
        mostrarMensaje('Error: ' + error.message);
    }
}


function validarTelefono(telefono) {
    const digitos = telefono.replace(/\D/g, '');
    return digitos.length >= 7;
}


async function cargarEquipos() {
    try {
        const response = await fetch(API_BASE + '_get.php');

        if (!response.ok) {
            throw new Error('Error en el servidor');
        }

        equipos = await response.json();

        equipos = ordenamientoPorInsercion(equipos, 'nombre');

        nombresEquipos = equipos.map(function (equipo) {
            return equipo.nombre.toLowerCase();
        });

        mostrarEquipos(equipos);
        mostrarArregloEnConsola();
        return equipos;

    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

async function crearEquipo(nombre, representante, telefono) {

    const conflictoNombre = verificarNombreEquipo(nombresEquipos, 0, nombre.toLowerCase(), null);
    if (conflictoNombre.conflicto) {
        throw new Error('Ya existe un equipo con ese nombre');
    }

    const formData = new FormData();
    formData.append('nombre', nombre);
    formData.append('representante', representante);
    formData.append('telefono', telefono);

    const response = await fetch(API_BASE + '_post.php', {
        method: 'POST',
        body: formData
    });

    const resultado = await response.json();

    if (!response.ok || !resultado.success) {
        throw new Error(resultado.message || 'Error al crear equipo');
    }

    await recargarDatos();
    mostrarMensaje('Equipo creado correctamente');
}


async function actualizarEquipo(id, nombre, representante, telefono) {

    const conflictoNombre = verificarNombreEquipo(nombresEquipos, 0, nombre.toLowerCase(), id);
    if (conflictoNombre.conflicto) {
        throw new Error('Ese nombre está en uso');
    }

    const formData = new FormData();
    formData.append('id', id);
    formData.append('nombre', nombre);
    formData.append('representante', representante);
    formData.append('telefono', telefono);

    const response = await fetch(API_BASE + '_put.php', {
        method: 'POST',
        body: formData
    });

    const resultado = await response.json();

    if (!response.ok || !resultado.success) {
        throw new Error(resultado.message || 'Error al actualizar información');
    }

    // ACTUALIZACIÓN DESPUÉS del éxito (como árbitros)
    await recargarDatos();
    mostrarMensaje('Informacion actualizada correctamente');
}


function ordenamientoPorInsercion(arreglo, clave) {
    const arregloOrdenado = [...arreglo];

    for (let i = 1; i < arregloOrdenado.length; i++) {
        const elementoActual = arregloOrdenado[i];
        let j = i - 1;

        while (j >= 0 && arregloOrdenado[j][clave].localeCompare(elementoActual[clave]) > 0) {
            arregloOrdenado[j + 1] = arregloOrdenado[j];
            j--;
        }

        arregloOrdenado[j + 1] = elementoActual;
    }

    return arregloOrdenado;
}


function verificarNombreEquipo(nombres, indice, nombreBuscado, equipoId) {
    if (indice >= nombres.length) {
        return {
            conflicto: false,
            mensaje: 'Nombre disponible'
        };
    }

    const nombreActual = nombres[indice];
    const equipoActual = equipos[indice];

    if (equipoId && equipoActual && equipoActual.id === equipoId) {
        return verificarNombreEquipo(nombres, indice + 1, nombreBuscado, equipoId);
    }

    if (nombreActual === nombreBuscado) {
        return {
            conflicto: true,
            mensaje: 'Ya existe un equipo con el nombre: ' + nombreBuscado,
            equipoConflictivo: equipoActual
        };
    }

    return verificarNombreEquipo(nombres, indice + 1, nombreBuscado, equipoId);
}


function limpiarFormulario() {
    const form = document.getElementById('formEquipo');
    if (form) {
        form.reset();
    }
    equipoEditando = null;
    const btnGuardar = document.getElementById('btnGuardar');
    if (btnGuardar) {
        btnGuardar.textContent = 'Guardar';
    }
    const btnCancelar = document.getElementById('btnCancelar');
    if (btnCancelar) {
        btnCancelar.style.display = 'none';
    }
}


function cancelarEdicion() {
    limpiarFormulario();
}


function mostrarMensaje(mensaje) {
    alert(mensaje);
}

function mostrarArregloEnConsola() {
    console.log('Canchibol');
    console.log('Total de equipos activos: ' + equipos.length);

    equipos.forEach(function (equipo, index) {
        console.log((index + 1) + '. ID: ' + equipo.id + ' | ' + equipo.nombre);
        console.log('   Representante: ' + equipo.representante + ' | Tel: ' + equipo.telefono);
    });
}


function editarEquipo(id) {
    try {
        const idNumero = Number(id);
        const equipo = equipos.find(function (e) { return e.id === idNumero; });
        if (equipo) {
            document.getElementById('nombreEquipo').value = equipo.nombre;
            document.getElementById('representante').value = equipo.representante;
            document.getElementById('telefono').value = equipo.telefono;

            equipoEditando = idNumero;
            document.getElementById('btnGuardar').textContent = 'Actualizar';
            document.getElementById('btnCancelar').style.display = 'inline-block';
        }
    } catch (error) {
        mostrarMensaje('Error al cargar datos del equipo');
    }
}


document.addEventListener('DOMContentLoaded', function () {
    inicializarEquipos();
});
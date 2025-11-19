
//api
async function cargarArbitros() {
    try {
        const respuesta = await fetch('../php/arbitros_get.php');
        if (!respuesta.ok) throw new Error('Error en el servidor');
        const arbitros = await respuesta.json();
        return arbitros.filter(arbitro => arbitro.disponible === 1 || arbitro.disponible === true);
    } catch (error) {
        return [];
    }
}

function llenarDropdownArbitros(arbitros) {
    const selectArbitro = document.querySelector('select[name="arbitro"]');
    selectArbitro.innerHTML = '<option value="">Seleccione árbitro</option>';
    arbitros.forEach(arbitro => {
        const option = document.createElement('option');
        option.value = arbitro.id;
        option.textContent = arbitro.nombre;
        selectArbitro.appendChild(option);
    });
}

async function obtenerTodosPartidos() {
    try {
        const respuesta = await fetch('../php/partido_get.php');
        if (!respuesta.ok) throw new Error('Error en el servidor');
        const partidos = await respuesta.json();
        return partidos.map(partido => ({
            ...partido,
            id: Number(partido.id),
            arbitro_id: Number(partido.arbitro_id)
        }));
    } catch (error) {
        throw error;
    }
}

async function crearPartido(partido) {
    try {
        const respuesta = await fetch('../php/partido_post.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(partido)
        });
        const resultado = await respuesta.json();
        return resultado;
    } catch (error) {
        throw error;
    }
}

async function actualizarPartido(id, partido) {
    try {
        const respuesta = await fetch('../php/partido_put.php', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, ...partido })
        });
        const resultado = await respuesta.json();
        return resultado;
    } catch (error) {
        throw error;
    }
}

async function eliminarPartido(id) {
    try {
        const respuesta = await fetch('../php/partido_delete.php', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        });
        const resultado = await respuesta.json();
        return resultado;
    } catch (error) {
        throw error;
    }
}

async function cargarPartidosDesdeAPI() {
    try {
        const partidos = await obtenerTodosPartidos();
        return partidos;
    } catch (error) {
        return [];
    }
}


//var gobales
let partidos = [];
let arbitrosDisponibles = [];
let editandoId = null;


// logica interfaz
function mostrarPartidos(partidos) {
    const tbody = document.querySelector('table tbody');
    tbody.innerHTML = '';

    if (partidos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No hay partidos programados</td></tr>';
        return;
    }

    partidos.forEach(partido => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${partido.fecha}</td>
            <td>${partido.hora}</td>
            <td>${partido.cancha}</td>
            <td>${partido.arbitro_nombre}</td>
            <td>${partido.equipo1} vs ${partido.equipo2}</td>
            <td class="celda-acciones">
                <button class="btn-accion btn-editar" onclick="editarPartido(${partido.id})">Editar</button>
                <button class="btn-accion btn-eliminar" onclick="eliminarPartidoConfirm(${partido.id})">Eliminar</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

//arreglo dinamico
function mostrarArregloEnConsola() {
    console.log('Registro de Partidos');
    console.log('Total de partidos:', partidos.length);
    partidos.forEach((partido, index) => {
        console.log(`${index + 1}. ID: ${partido.id} | ${partido.fecha} ${partido.hora}`);
        console.log(`   Cancha: ${partido.cancha} | Árbitro: ${partido.arbitro_nombre}`);
        console.log(`   Partido: ${partido.equipo1} vs ${partido.equipo2}`);
    });

    console.log('Arbitros disponibles');
    arbitrosDisponibles.forEach((arbitro, index) => {
        console.log(`${index + 1}. ID: ${arbitro.id} | ${arbitro.nombre} | Tel: ${arbitro.telefono}`);
    });
} 


function limpiarFormulario() {
    document.querySelector('.formulario').reset();
    editandoId = null;
    document.querySelector('.formulario button').textContent = 'Guardar';
}


function mostrarMensaje(mensaje) {
    alert(mensaje);
}


function editarPartido(id) {
    try {
        const idNumero = Number(id);
        const partido = partidos.find(p => p.id === idNumero);
        if (partido) {
            const form = document.querySelector('.formulario');
            form.querySelector('input[type="date"]').value = partido.fecha;
            form.querySelector('input[type="time"]').value = partido.hora;
            form.querySelector('select[name="cancha"]').value = partido.cancha;
            form.querySelector('select[name="arbitro"]').value = partido.arbitro_id;
            form.querySelector('input[name="equipo1"]').value = partido.equipo1;
            form.querySelector('input[name="equipo2"]').value = partido.equipo2;
            editandoId = idNumero;
            form.querySelector('button').textContent = 'Actualizar';
        }
    } catch (error) {
        mostrarMensaje('Error al cargar datos del partido');
    }
}

function eliminarPartidoConfirm(id) {
    const idNumero = Number(id);
    const partido = partidos.find(p => p.id === idNumero);
    if (partido && confirm('¿Estás seguro de eliminar ' + partido.equipo1 + ' vs ' + partido.equipo2 + '?')) {
        eliminarPartidoAsync(idNumero);
    }
}

async function eliminarPartidoAsync(id) {
    try {
        await eliminarPartido(id);
        partidos = await cargarPartidosDesdeAPI();
        mostrarPartidos(partidos);
        mostrarArregloEnConsola();
        mostrarMensaje('Partido eliminado correctamente');
    } catch (error) {
        mostrarMensaje('Error al eliminar partido');
    }
}


// validaciones de los 40 minutos de partidos
function validarEspacioPartidos(fecha, hora, cancha, arbitro_id, partidoId = null) {
    const horaInicio = new Date(`${fecha}T${hora}`);
    const horaFin = new Date(horaInicio.getTime() + 40 * 60000);

    // verifica que no se agende cancha en un dia y hora igual
    const conflictoCancha = partidos.some(partido => {
        if (partidoId && partido.id === partidoId) return false;

        const partidoHoraInicio = new Date(`${partido.fecha}T${partido.hora}`);
        const partidoHoraFin = new Date(partidoHoraInicio.getTime() + 40 * 60000);

        return partido.fecha === fecha &&
               partido.cancha === cancha &&
               ((horaInicio >= partidoHoraInicio && horaInicio < partidoHoraFin) ||
                (horaFin > partidoHoraInicio && horaFin <= partidoHoraFin) ||
                (horaInicio <= partidoHoraInicio && horaFin >= partidoHoraFin));
    });

    if (conflictoCancha) {
        return 'La cancha está ocupada en ese horario. Los partidos duran 40 minutos.';
    }

    //asegura que el arbitro no este agendado a un partido dentro de 40 min
    const conflictoArbitro = partidos.some(partido => {
        if (partidoId && partido.id === partidoId) return false;

        const partidoHoraInicio = new Date(`${partido.fecha}T${partido.hora}`);
        const partidoHoraFin = new Date(partidoHoraInicio.getTime() + 40 * 60000);

        return partido.fecha === fecha &&
               partido.arbitro_id === arbitro_id &&
               ((horaInicio >= partidoHoraInicio && horaInicio < partidoHoraFin) ||
                (horaFin > partidoHoraInicio && horaFin <= partidoHoraFin) ||
                (horaInicio <= partidoHoraInicio && horaFin >= partidoHoraFin));
    });

    if (conflictoArbitro) {
        return 'El árbitro ya tiene un partido asignado en ese horario.';
    }

    return null;
}


// evento de formulario
document.querySelector('.formulario').addEventListener('submit', async function (e) {
    e.preventDefault();

    const form = e.target;
    const partidoData = {
        fecha: form.querySelector('input[type="date"]').value,
        hora: form.querySelector('input[type="time"]').value,
        cancha: form.querySelector('select[name="cancha"]').value,
        arbitro_id: parseInt(form.querySelector('select[name="arbitro"]').value),
        equipo1: form.querySelector('input[name="equipo1"]').value.trim(),
        equipo2: form.querySelector('input[name="equipo2"]').value.trim()
    };

    // verificar campos completos
    if (!partidoData.fecha || !partidoData.hora || !partidoData.cancha ||
        !partidoData.arbitro_id || !partidoData.equipo1 || !partidoData.equipo2) {
        mostrarMensaje('Por favor completa todos los campos');
        return;
    }

    // espacios entre partidos
    const errorValidacion = validarEspacioPartidos(
        partidoData.fecha,
        partidoData.hora,
        partidoData.cancha,
        partidoData.arbitro_id,
        editandoId
    );

    if (errorValidacion) {
        mostrarMensaje(errorValidacion);
        limpiarFormulario();
        return;
    }

    try {
        let result;
        if (editandoId) {
            result = await actualizarPartido(editandoId, partidoData);
        } else {
            result = await crearPartido(partidoData);
        }

        if (result.success) {
            mostrarMensaje(result.message);
            partidos = await cargarPartidosDesdeAPI();
            mostrarPartidos(partidos);
            mostrarArregloEnConsola();
            limpiarFormulario();
        } else {
            mostrarMensaje(result.message);
            limpiarFormulario();
        }

    } catch (error) {
        mostrarMensaje('Error de conexión');
        limpiarFormulario();
    }
});


// inicializacion
document.addEventListener('DOMContentLoaded', async function () {
    try {
        arbitrosDisponibles = await cargarArbitros();
        llenarDropdownArbitros(arbitrosDisponibles);
        partidos = await cargarPartidosDesdeAPI();
        mostrarPartidos(partidos);
        mostrarArregloEnConsola();
    } catch (error) {
        mostrarMensaje('Error al cargar los datos');
    }

});

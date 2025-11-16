let partidos = [
    {
        id: 1,
        equipo1: "RHINOS",
        equipo2: "DEPORTIVO DINA",
        fecha: "05-11-2025",
        hora: "08:50",
        cancha: "1",
        titular: "Arbitro Principal"
    },
    {
        id: 2,
        equipo1: "FRANCO CANADIENSE",
        equipo2: "RVA INSTALACIONES",
        fecha: "05-11-2025",
        hora: "08:50",
        cancha: "2",
        titular: "Arbitro Secundario"
    }
];

let editandoPartido = null;
function mostrarPartidos() {
    const tbody = document.querySelector('.tabla-partifod tbody');
    tbody.innerHTML = '';

    partidos.forEach(partido => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
        <td class="hora-partido">${partido.hora}</td>
        <td class="equipo-local">${partido.equipo1}</td>
        <td class="vs">VS<td/>
        <td class="equipo-visitante">${partido.equipo2}</td>
        <td class="campo">${partido.cancha}</td>
        <td>
        <button onclick="editarPartido(${partido.id})">Editar<button>
        <button onclick="eliminarPartido(${partido.id})">Eliminar<button>
        </td>
        `;
        tbody.appendChild(tr);
    });
}

function agregarPartido(event) {
    event.preventDefault();

    const nuevoPartido = {
        id: editandoPartido || Date.now(),
        equipo1: document.getElementById('equipo1').value,
        equipo2: document.getElementById('equipo2').value,
        fecha: document.getElementById('fecha').value,
        hora: document.getElementById('hora').value,
        cancha: document.getElementById('cancha').value,
        titular: document.getElementById('arbitro').value,
    };

    if (editandoPartido) {
        const index = partidos.findIndex(p => p.id === editandoPartido);
        partidos[index] = nuevoPartido;
        editandoPartido = null;
        document.getElementById('btnGuardarPartido').textContent='GuardarPartido';
    } else {
        partidos.push(nuevoPartido);
    }

    mostrarPartidos();
    document.getElementById('fromPartido').resest();
    console.log('Partidos actualizados:', partidos);
}

function editarPartido(id) {
    const partido = partidos.find(p=>p.id === id);

    if (partido) {
        document.getElementById('equipo1').value=partido.equipo1;
        document.getElementById('equipo2').value=partido.equipo2;
        document.getElementById('fecha').value=partido.fecha;
        document.getElementById('hora').value=partido.hora;
        document.getElementById('cancha').value=partido.cancha;
        document.getElementById('arbitro').value=partido.titular;

        editandoPartido = id;
        document.getElementById('btnGuardarArbitro').textContent='ActualizarPartido';
    }
}

function eliminarPartido(id) {
    if (confirm('¿Estas seguro de eliminar este partido?')) {
        partidos = partidos.filter(p=>p.id !== id);
        mostrarPartidos();
    }
}

function filtrarPartidosPorFecha(fecha) {
    return partidos.filter(partido=>partido.fecha === fecha);
}

document.addEventListener('DOMContentLoaded', function() {
    mostrarPartidos();
});
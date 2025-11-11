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
        const index = arbitros.findIndex(arbitro => arbitro.id === editandoId);  // busca la posicion del arbitro en el array
        arbitros[index] = nuevoArbitro;
        editandoId = null;
        btnGuardar.textContent = 'Guardar';
    } else {
        arbitros.push(nuevoArbitro);
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
    }
}


function eliminarArbitro(id) {
    if (confirm('¿Estás seguro de que quieres eliminar este árbitro?')) {
        arbitros = arbitros.filter(arbitro => arbitro.id !== id);
        actualizarTabla();
        mostrarArregloEnConsola();
    }
}

document.addEventListener('DOMContentLoaded', function () {
    actualizarTabla();
    mostrarArregloEnConsola();
});
// 
class NodoPartido {
    constructor(partido) {
        this.partido = partido;
        this.siguiente = null;
    }
}

class ListaPartidosEnlazada {
    constructor() {
        this.cabeza = null;
        this.tamanio = 0;
    }


    verificarConflictoRecursivo(nodo, nuevoPartido, partidoId = null) {
        if (!nodo) {
            return null;
        }

        const partidoExistente = nodo.partido;

        if (partidoId && partidoExistente.id === partidoId) {
            return this.verificarConflictoRecursivo(nodo.siguiente, nuevoPartido, partidoId);
        }

        // verificar conflicto de cancha (misma fecha, misma cancha, mismo horario)
        if (partidoExistente.fecha === nuevoPartido.fecha &&
            partidoExistente.cancha === nuevoPartido.cancha &&
            this.horariosSeSolapan(partidoExistente.hora, nuevoPartido.hora)) {

            return {
                conflicto: true,
                tipo: 'cancha',
                partidoExistente: partidoExistente,
                mensaje: `Conflicto de horario en ${nuevoPartido.cancha}. Los partidos duran 40 minutos. Elija otra cancha o programe 40 minutos después.`
            };
        }

        // evitar que se asigne un arbitro cuando este está asignado en un partido
        if (partidoExistente.fecha === nuevoPartido.fecha &&
            partidoExistente.arbitro_id === nuevoPartido.arbitro_id &&
            this.horariosSeSolapan(partidoExistente.hora, nuevoPartido.hora)) {

            return {
                conflicto: true,
                tipo: 'arbitro',
                partidoExistente: partidoExistente,
                mensaje: `El árbitro ya cuenta con un partido programado en esta fecha a las ${nuevoPartido.hora}`
            };
        }

        return this.verificarConflictoRecursivo(nodo.siguiente, nuevoPartido, partidoId);
    }

    horariosSeSolapan(hora1, hora2) {
        const [h1, m1] = hora1.split(':').map(Number);
        const [h2, m2] = hora2.split(':').map(Number);

        const minutos1 = h1 * 60 + m1;
        const minutos2 = h2 * 60 + m2;

        // los partidos duran 40 minutos porque yo creo q si
        return Math.abs(minutos1 - minutos2) < 40;
    }


    // Ordenamiento por insercion que acmoda partidos por fecha y hora
    insertarOrdenado(partido) {
        const nuevoNodo = new NodoPartido(partido);

        if (!this.cabeza || this.compararPartidos(partido, this.cabeza.partido) < 0) {
            nuevoNodo.siguiente = this.cabeza;
            this.cabeza = nuevoNodo;
        } else {
            let actual = this.cabeza;
            while (actual.siguiente && this.compararPartidos(partido, actual.siguiente.partido) >= 0) {
                actual = actual.siguiente;
            }
            nuevoNodo.siguiente = actual.siguiente;
            actual.siguiente = nuevoNodo;
        }

        this.tamanio++;
    }

    compararPartidos(a, b) {
        const fechaA = new Date(a.fecha + 'T' + a.hora);
        const fechaB = new Date(b.fecha + 'T' + b.hora);
        return fechaA - fechaB;
    }


    // pasar de lista a array
    toArray() {
        const array = [];
        let actual = this.cabeza;

        while (actual) {
            array.push(actual.partido);
            actual = actual.siguiente;
        }

        return array;
    }


    // recursividad
    buscarPorIdRecursivo(id, nodo = this.cabeza) {
        if (!nodo) {
            return null;
        }

        if (nodo.partido.id === id) {
            return nodo.partido;
        }

        return this.buscarPorIdRecursivo(id, nodo.siguiente);
    }


    // eliminar partido de la lista
    eliminarPartido(id) {
        if (!this.cabeza) return false;

        if (this.cabeza.partido.id === id) {
            this.cabeza = this.cabeza.siguiente;
            this.tamanio--;
            return true;
        }

        let actual = this.cabeza;
        while (actual.siguiente) {
            if (actual.siguiente.partido.id === id) {
                actual.siguiente = actual.siguiente.siguiente;
                this.tamanio--;
                return true;
            }
            actual = actual.siguiente;
        }
        return false;
    }

    // Mostrar estructura de lista en consola para demostración
    mostrarEstructuraEnConsola(sistemaRef = null) {
        console.log('Lista simplemente enlazada');
        console.log(`Tamaño de la lista: ${this.tamanio}`);

        let actual = this.cabeza;
        let posicion = 1;
        while (actual) {
            const p = actual.partido;
            let equipo1Nombre, equipo2Nombre;

            if (sistemaRef && sistemaRef.obtenerNombreEquipo) {
                equipo1Nombre = sistemaRef.obtenerNombreEquipo(p.equipo1);
                equipo2Nombre = sistemaRef.obtenerNombreEquipo(p.equipo2);
            } else {
                equipo1Nombre = `Equipo ${p.equipo1}`;
                equipo2Nombre = `Equipo ${p.equipo2}`;
            }

            const horaFormateada = p.hora.substring(0, 5);

            console.log(`Nodo ${posicion}:`);
            console.log(`  - Partido: ${equipo1Nombre} vs ${equipo2Nombre}`);
            console.log(`  - Fecha/Hora: ${p.fecha} ${horaFormateada}`);
            console.log(`  - Cancha: ${p.cancha}`);
            actual = actual.siguiente;
            posicion++;
        }
    }
}


class SistemaPartidosCompleto {
    constructor() {
        this.listaPartidos = new ListaPartidosEnlazada();
        this.partidosArray = [];
        this.equipos = [];
        this.arbitrosDisponibles = [];
        this.editandoId = null;
    }

    // cargar equipos existentes en BD y llenar menus desplegables
    async cargarEquipos() {
        try {
            const respuesta = await fetch('../php/equipos_get.php');
            if (!respuesta.ok) throw new Error('Error en el servidor');
            const equipos = await respuesta.json();
            this.equipos = equipos.filter(equipo => equipo.estado === 1 || equipo.estado === true);
            this.llenarDropdownsEquipos();
            return this.equipos;
        } catch (error) {
            console.error('Error cargando equipos:', error);
            return [];
        }
    }

    llenarDropdownsEquipos() {
        const selectEquipo1 = document.querySelector('select[name="equipo1"]');
        const selectEquipo2 = document.querySelector('select[name="equipo2"]');

        selectEquipo1.innerHTML = '<option value="">Seleccione equipo 1</option>';
        selectEquipo2.innerHTML = '<option value="">Seleccione equipo 2</option>';

        // Llenar con equipos activos (1 en BD)
        this.equipos.forEach(equipo => {
            const option1 = document.createElement('option');
            option1.value = equipo.id;
            option1.textContent = equipo.nombre;
            selectEquipo1.appendChild(option1);

            const option2 = document.createElement('option');
            option2.value = equipo.id;
            option2.textContent = equipo.nombre;
            selectEquipo2.appendChild(option2);
        });

        // cctualizar menus cuando se selecciona el equipo 1
        selectEquipo1.addEventListener('change', () => {
            this.actualizarDropdownEquipo2();
        });
    }

    actualizarDropdownEquipo2() {
        const selectEquipo1 = document.querySelector('select[name="equipo1"]');
        const selectEquipo2 = document.querySelector('select[name="equipo2"]');
        const equipo1Seleccionado = selectEquipo1.value;

        const equipo2Actual = selectEquipo2.value;

        // limpiar y volver a llenar excluyendo el equipo 1 seleccionado previamente
        selectEquipo2.innerHTML = '<option value="">Seleccione equipo 2</option>';

        this.equipos.forEach(equipo => {
            if (equipo.id != equipo1Seleccionado) {
                const option = document.createElement('option');
                option.value = equipo.id;
                option.textContent = equipo.nombre;
                selectEquipo2.appendChild(option);
            }
        });

        if (equipo2Actual && equipo2Actual != equipo1Seleccionado) {
            selectEquipo2.value = equipo2Actual;
        }
    }


    async cargarArbitros() {
        try {
            const respuesta = await fetch('../php/arbitros_get.php');
            if (!respuesta.ok) throw new Error('Error en el servidor');
            const arbitros = await respuesta.json();
            this.arbitrosDisponibles = arbitros.filter(arbitro => arbitro.disponible === 1 || arbitro.disponible === true);
            this.llenarDropdownArbitros();
            return this.arbitrosDisponibles;
        } catch (error) {
            console.error('Error cargando árbitros:', error);
            return [];
        }
    }

    llenarDropdownArbitros() {
        const selectArbitro = document.querySelector('select[name="arbitro"]');
        selectArbitro.innerHTML = '<option value="">Seleccione árbitro</option>';

        this.arbitrosDisponibles.forEach(arbitro => {
            const option = document.createElement('option');
            option.value = arbitro.id;
            option.textContent = arbitro.nombre;
            selectArbitro.appendChild(option);
        });
    }

    async cargarPartidos() {
        try {
            const respuesta = await fetch('../php/partido_get.php');
            if (!respuesta.ok) throw new Error('Error en el servidor');
            const partidos = await respuesta.json();

            // almacenar en arreglo
            this.partidosArray = partidos.map(partido => ({
                ...partido,
                id: Number(partido.id),
                arbitro_id: Number(partido.arbitro_id)
            }));

            // cargar en lista enlazada con ordenamiento por insercion
            this.listaPartidos = new ListaPartidosEnlazada();
            this.partidosArray.forEach(partido => {
                this.listaPartidos.insertarOrdenado(partido);
            });

            this.mostrarPartidos();
            this.mostrarEnConsola();

            return this.partidosArray;
        } catch (error) {
            console.error('Error cargando partidos:', error);
            return [];
        }
    }

    mostrarPartidos() {
        const tbody = document.querySelector('table tbody');
        tbody.innerHTML = '';

        const partidosOrdenados = this.listaPartidos.toArray();

        if (partidosOrdenados.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No hay partidos programados</td></tr>';
            return;
        }

        partidosOrdenados.forEach(partido => {
            const tr = document.createElement('tr');

            // obtener nombres de equipos para mostrar en tabla
            const equipo1Nombre = this.obtenerNombreEquipo(partido.equipo1);
            const equipo2Nombre = this.obtenerNombreEquipo(partido.equipo2);

            tr.innerHTML = `
            <td>${partido.fecha}</td>
            <td>${partido.hora}</td>
            <td>${partido.cancha}</td>
            <td>${partido.arbitro_nombre}</td>
            <td>${equipo1Nombre} vs ${equipo2Nombre}</td>
            <td class="celda-acciones">
                <button class="btn-accion btn-editar" onclick="sistema.editarPartido(${partido.id})">Editar</button>
                <button class="btn-accion btn-eliminar" onclick="sistema.eliminarPartidoConfirm(${partido.id})">Eliminar</button>
            </td>
        `;
            tbody.appendChild(tr);
        });
    }

    // validacion usando recursividad de la lista enlazada
    validarEspacioPartidos(fecha, hora, cancha, arbitro_id, partidoId = null) {
        const partidoPrueba = { fecha, hora, cancha, arbitro_id };

        const conflicto = this.listaPartidos.verificarConflictoRecursivo(
            this.listaPartidos.cabeza,
            partidoPrueba,
            partidoId
        );

        if (conflicto) {
            return conflicto.mensaje;
        }

        return null;
    }

    async crearPartido(partidoData) {
        try {
            const respuesta = await fetch('../php/partido_post.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(partidoData)
            });
            const resultado = await respuesta.json();
            return resultado;
        } catch (error) {
            throw error;
        }
    }

    async actualizarPartido(id, partidoData) {
        try {
            const respuesta = await fetch('../php/partido_put.php', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, ...partidoData })
            });
            const resultado = await respuesta.json();
            return resultado;
        } catch (error) {
            throw error;
        }
    }

    async eliminarPartido(id) {
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

    editarPartido(id) {
        const partido = this.listaPartidos.buscarPorIdRecursivo(id);
        if (partido) {
            const form = document.querySelector('.formulario');
            form.querySelector('input[type="date"]').value = partido.fecha;
            form.querySelector('input[type="time"]').value = partido.hora;
            form.querySelector('select[name="cancha"]').value = partido.cancha;
            form.querySelector('select[name="arbitro"]').value = partido.arbitro_id;

            const selectEquipo1 = form.querySelector('select[name="equipo1"]');
            const selectEquipo2 = form.querySelector('select[name="equipo2"]');
            selectEquipo1.value = partido.equipo1;
            selectEquipo2.value = partido.equipo2;

            this.editandoId = id;
            form.querySelector('button').textContent = 'Actualizar';

            // actualizar menu del equipo2 para excluir el equipo1 seleccionado
            this.actualizarDropdownEquipo2();
        }
    }

    eliminarPartidoConfirm(id) {
        const partido = this.listaPartidos.buscarPorIdRecursivo(id);
        if (partido) {
            const equipo1Nombre = this.obtenerNombreEquipo(partido.equipo1);
            const equipo2Nombre = this.obtenerNombreEquipo(partido.equipo2);

            if (confirm('¿Estás seguro de eliminar ' + equipo1Nombre + ' vs ' + equipo2Nombre + '?')) {
                this.eliminarPartidoAsync(id);
            }
        }
    }

    async eliminarPartidoAsync(id) {
        try {
            await this.eliminarPartido(id);
            await this.cargarPartidos();
            this.mostrarMensaje('Partido eliminado correctamente');
        } catch (error) {
            this.mostrarMensaje('Error al eliminar partido');
        }
    }

    limpiarFormulario() {
        document.querySelector('.formulario').reset();
        this.editandoId = null;
        document.querySelector('.formulario button').textContent = 'Guardar';
        this.actualizarDropdownEquipo2(); // resetea menu
    }

    mostrarMensaje(mensaje) {
        alert(mensaje);
    }

    // nombres de equipo en lugar de ids de bd
    obtenerNombreEquipo(idEquipo) {
        const equipo = this.equipos.find(e => e.id == idEquipo);
        return equipo ? equipo.nombre : `Equipo ${idEquipo}`;
    }

    // Mostrar estructuras en consola para demostración
    mostrarEnConsola() {
        console.log('Total de partidos registrdos:', this.partidosArray.length);
        this.partidosArray.forEach((partido, index) => {
            const horaFormateada = partido.hora.substring(0, 5); // Quitar segundos si existen
            const equipo1Nombre = this.obtenerNombreEquipo(partido.equipo1);
            const equipo2Nombre = this.obtenerNombreEquipo(partido.equipo2);

            console.log(`${index + 1}. ID: ${partido.id} | ${partido.fecha} ${horaFormateada} |
                 ${partido.cancha} | ${equipo1Nombre} vs ${equipo2Nombre}`);
        });

        this.listaPartidos.mostrarEstructuraEnConsola(this);

        /*  console.log('Equipos');
          this.equipos.forEach((equipo, index) => {
              console.log(`${index + 1}. ${equipo.nombre} (ID: ${equipo.id})`); 
          }); */
    }

    // inicializar app web y sus respectivos datos
    async inicializar() {
        await this.cargarEquipos();
        await this.cargarArbitros();
        await this.cargarPartidos();
        this.configurarEventos();
    }

    configurarEventos() {
        const formulario = document.querySelector('.formulario');

        formulario.addEventListener('submit', async (e) => {
            e.preventDefault();

            const form = e.target;
            const partidoData = {
                fecha: form.querySelector('input[type="date"]').value,
                hora: form.querySelector('input[type="time"]').value,
                cancha: form.querySelector('select[name="cancha"]').value,
                arbitro_id: parseInt(form.querySelector('select[name="arbitro"]').value),
                equipo1: form.querySelector('select[name="equipo1"]').value,
                equipo2: form.querySelector('select[name="equipo2"]').value
            };

            if (!partidoData.fecha || !partidoData.hora || !partidoData.cancha ||
                !partidoData.arbitro_id || !partidoData.equipo1 || !partidoData.equipo2) {
                this.mostrarMensaje('Por favor completa todos los campos');
                return;
            }

            if (partidoData.equipo1 === partidoData.equipo2) {
                this.mostrarMensaje('No puede seleccionar el mismo equipo para ambos lados. Por favor, elija equipos diferentes');
                return;
            }

            // validar conflictos usando recursividad
            const errorValidacion = this.validarEspacioPartidos(
                partidoData.fecha,
                partidoData.hora,
                partidoData.cancha,
                partidoData.arbitro_id,
                this.editandoId
            );

            if (errorValidacion) {
                this.mostrarMensaje(errorValidacion);
                return;
            }

            try {
                let result;
                if (this.editandoId) {
                    result = await this.actualizarPartido(this.editandoId, partidoData);
                } else {
                    result = await this.crearPartido(partidoData);
                }

                if (result.success) {
                    this.mostrarMensaje(result.message);
                    await this.cargarPartidos(); // Recargar datos
                    this.limpiarFormulario();
                } else {
                    this.mostrarMensaje(result.message);
                }

            } catch (error) {
                this.mostrarMensaje('Error de conexión');
            }
        });
    }
}

// Instancia global del sistema
const sistema = new SistemaPartidosCompleto();

// Inicializar cuando se cargue la pagina
document.addEventListener('DOMContentLoaded', async function () {
    await sistema.inicializar();
});
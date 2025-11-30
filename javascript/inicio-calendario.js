// inicio-calendario.js - Sistema de calendario para página de inicio

class CalendarioInicio {
    constructor() {
        this.partidos = [];
        this.equipos = [];
    }

    // Obtener equipos desde la base de datos
    async cargarEquipos() {
        try {
            const respuesta = await fetch('../php/equipos_get.php');
            if (!respuesta.ok) throw new Error('Error al cargar equipos');
            const equipos = await respuesta.json();
      
            if (Array.isArray(equipos)) {
                this.equipos = equipos.filter(equipo => equipo.estado === 1 || equipo.estado === true || equipo.estado === '1');
            } else if (equipos.equipos) {
                this.equipos = equipos.equipos.filter(equipo => equipo.estado === 1 || equipo.estado === true || equipo.estado === '1');
            } else {
                this.equipos = [];
            }
            
            return this.equipos;
        } catch (error) {
            console.error('Error cargando equipos:', error);
            this.equipos = [];
            return [];
        }
    }

    // Obtener nombre del equipo por ID
    obtenerNombreEquipo(idEquipo) {
        const equipo = this.equipos.find(e => e.id == idEquipo);
        return equipo ? equipo.nombre : `Equipo ${idEquipo}`;
    }

    // Obtener partidos desde la base de datos
    async cargarPartidos() {
        try {
            const respuesta = await fetch('../php/calendario_get.php');
            if (!respuesta.ok) throw new Error('Error al cargar partidos');
            const data = await respuesta.json();
            
            if (Array.isArray(data)) {
                this.partidos = data;
            } else if (data.partidos) {
                this.partidos = data.partidos;
            } else if (data.error) {
                console.error('Error del servidor:', data.error);
                this.partidos = [];
            } else {
                this.partidos = [];
            }
            
            return this.partidos;
        } catch (error) {
            console.error('Error cargando partidos:', error);
            this.partidos = [];
            return [];
        }
    }
    
    // Mostrar partidos en la tabla (solo con HORA, EQUIPO LOCAL, VS, EQUIPO VISITANTE, CAMPO)
    mostrarPartidos() {
        const tbody = document.querySelector('.tabla-partidos tbody');
        if (!tbody) {
            console.error('No se encontró el tbody de la tabla');
            return;
        }
        
        tbody.innerHTML = '';

        if (this.partidos.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No hay partidos programados</td></tr>';
            return;
        }

        this.partidos.forEach(partido => {
            const tr = document.createElement('tr');

            // Obtener nombres de equipos
            const equipoLocal = this.obtenerNombreEquipo(partido.equipo1);
            const equipoVisitante = this.obtenerNombreEquipo(partido.equipo2);

            tr.innerHTML = `
                <td>${partido.hora}</td>
                <td>${equipoLocal}</td>
                <td>VS</td>
                <td>${equipoVisitante}</td>
                <td>${partido.cancha}</td>
            `;
            tbody.appendChild(tr);
        });
    }

    // Renderizar todo el calendario (cargar datos y mostrar)
    async renderizarCalendario() {
        try {
            // Cargar equipos primero
            await this.cargarEquipos();
            // Luego cargar partidos
            await this.cargarPartidos();
            // Finalmente mostrar en la tabla
            this.mostrarPartidos();
        } catch (error) {
            console.error('Error renderizando calendario:', error);
        }
    }

    // Inicializar el calendario
    async inicializar() {
        console.log('Inicializando calendario de inicio...');
        await this.renderizarCalendario();
        console.log(`Partidos cargados: ${this.partidos.length}`);
        console.log(`Equipos cargados: ${this.equipos.length}`);
        
        // Actualizar cada 30 segundos
        setInterval(() => {
            this.renderizarCalendario();
        }, 30000);
    }
}

// Instancia global para la página de inicio
const calendarioInicio = new CalendarioInicio();

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        calendarioInicio.inicializar();
    });
} else {
    calendarioInicio.inicializar();
}
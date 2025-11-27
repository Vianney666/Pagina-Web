// inicio-calendario.js - Sistema de calendario para página de inicio
// Este archivo es independiente del sistema de gestión de partidos (calendario.js)
// Evita doble carga si el sistema principal de partidos ya existe

class CalendarioInicio {
    constructor() {
        this.partidos = [];
        this.equipos = [];
        this.diasMostrados = [];
    }

    // Obtener los próximos 7 días desde hoy
    obtenerProximos7Dias() {
        const dias = [];
        const hoy = new Date();
        
        for (let i = 0; i < 7; i++) {
            const fecha = new Date();
            fecha.setDate(hoy.getDate() + i);
            dias.push({
                fecha: fecha,
                fechaStr: fecha.toISOString().split('T')[0],
                diaSemana: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][fecha.getDay()],
                diaNombre: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][fecha.getDay()],
                diaNumero: fecha.getDate(),
                mes: ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'][fecha.getMonth()],
                mesCompleto: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'][fecha.getMonth()],
                anio: fecha.getFullYear(),
                id: `dia${i + 1}`
            });
        }
        
        this.diasMostrados = dias;
        return dias;
    }

    // Obtener equipos desde la base de datos
    async cargarEquipos() {
        try {
            const respuesta = await fetch('../php/equipos_get.php');
            if (!respuesta.ok) throw new Error('Error al cargar equipos');
            const equipos = await respuesta.json();
            
            // Manejar si viene con o sin wrapper
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
            const respuesta = await fetch('../php/partido_get.php');
            if (!respuesta.ok) throw new Error('Error al cargar partidos');
            const data = await respuesta.json();
            
            // Tu PHP devuelve array directamente cuando no hay parámetro id
            if (Array.isArray(data)) {
                this.partidos = data;
            } else if (data.partidos) {
                // Por si acaso viene con wrapper
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

    // Contar partidos por fecha
    contarPartidosPorFecha(fechaStr) {
        return this.partidos.filter(p => p.fecha === fechaStr).length;
    }

    // Renderizar el calendario completo
    async renderizarCalendario() {
        await this.cargarEquipos();
        await this.cargarPartidos();
        
        const dias = this.obtenerProximos7Dias();
        const listaCalendario = document.querySelector('.pj_lista');
        
        if (!listaCalendario) return;
        
        listaCalendario.innerHTML = '';
        
        dias.forEach((dia, index) => {
            const cantidadPartidos = this.contarPartidosPorFecha(dia.fechaStr);
            
            const li = document.createElement('li');
            li.onclick = () => this.mostrarDia(dia.id);
            li.setAttribute('data-dia', dia.id);
            li.setAttribute('data-fecha', dia.fechaStr);
            li.className = `tab-dia ${index === 0 ? 'active' : ''}`;
            
            li.innerHTML = `
                <span class="pj_dia_txt">${dia.diaSemana}</span>
                <span class="pj_dia">${dia.diaNumero}</span>
                <span class="pj_cant_partidos">${cantidadPartidos}</span>
            `;
            
            listaCalendario.appendChild(li);
        });
        
        // Actualizar día actual
        this.actualizarDiaActual(dias[0]);
        
        // Mostrar partidos del primer día
        this.mostrarPartidosDelDia(dias[0]);
    }

    // Actualizar la sección "día actual"
    actualizarDiaActual(dia) {
        const hojaCal = document.querySelector('.hoja_cal');
        if (hojaCal) {
            hojaCal.innerHTML = `
                <span class="hc_top">${dia.mes}</span>
                <span class="hc_day">${dia.diaNumero}</span>
            `;
        }
        
        const tituloDia = document.querySelector('.titulo_dia');
        if (tituloDia) {
            const esHoy = new Date().toDateString() === dia.fecha.toDateString();
            tituloDia.textContent = esHoy ? `hoy ${dia.diaSemana.toLowerCase()}` : dia.diaNombre.toLowerCase();
        }
        
        const cantidadPartidos = this.contarPartidosPorFecha(dia.fechaStr);
        const partidosProgramados = document.querySelector('.partidos_programados');
        if (partidosProgramados) {
            partidosProgramados.textContent = `${cantidadPartidos} partido${cantidadPartidos !== 1 ? 's' : ''} programado${cantidadPartidos !== 1 ? 's' : ''}`;
        }
    }

    // Mostrar partidos de un día específico
    mostrarPartidosDelDia(diaInfo) {
        const partidosDelDia = this.partidos.filter(p => p.fecha === diaInfo.fechaStr);
        
        // Ordenar por hora
        partidosDelDia.sort((a, b) => {
            return a.hora.localeCompare(b.hora);
        });
        
        // Ocultar todas las tablas
        document.querySelectorAll('.tabla_de_juegos').forEach(tabla => {
            tabla.style.display = 'none';
        });
        
        // Buscar la tabla correspondiente
        const tablaDelDia = document.getElementById(`tabla-${diaInfo.id}`);
        if (tablaDelDia) {
            tablaDelDia.style.display = 'block';
            
            // Actualizar título
            const titulo = tablaDelDia.querySelector('.contenedor-tabla h2');
            if (titulo) {
                titulo.textContent = `CALENDARIO DE PARTIDOS - ${diaInfo.diaSemana.toUpperCase()} ${diaInfo.diaNumero}`;
            }
            
            // Actualizar fecha del estadio
            const fechaEstadio = tablaDelDia.querySelector('.fecha-estadio');
            if (fechaEstadio) {
                fechaEstadio.textContent = `${diaInfo.diaSemana.toUpperCase()} ${String(diaInfo.diaNumero).padStart(2, '0')} DE ${diaInfo.mesCompleto.toUpperCase()} ${diaInfo.anio}`;
            }
            
            // Actualizar tbody con partidos
            const tbody = tablaDelDia.querySelector('tbody');
            if (tbody) {
                if (partidosDelDia.length === 0) {
                    tbody.innerHTML = `
                        <tr>
                            <td colspan="5" style="text-align: center; padding: 20px; color: #666;">
                                No hay partidos programados para este día
                            </td>
                        </tr>
                    `;
                } else {
                    tbody.innerHTML = partidosDelDia.map(partido => {
                        const equipo1Nombre = this.obtenerNombreEquipo(partido.equipo1);
                        const equipo2Nombre = this.obtenerNombreEquipo(partido.equipo2);
                        const horaFormateada = partido.hora.substring(0, 5); // Quitar segundos
                        
                        return `
                            <tr>
                                <td class="hora-partido">${horaFormateada}</td>
                                <td class="equipo1">${equipo1Nombre}</td>
                                <td class="vs">VS</td>
                                <td class="equipo2">${equipo2Nombre}</td>
                                <td class="campo">${partido.cancha}</td>
                            </tr>
                        `;
                    }).join('');
                }
            }
        }
    }

    // Función para cambiar de día (llamada desde onclick)
    mostrarDia(diaId) {
        // Actualizar clases active
        document.querySelectorAll('.tab-dia').forEach(tab => {
            tab.classList.remove('active');
        });
        
        const tabActiva = document.querySelector(`[data-dia="${diaId}"]`);
        if (tabActiva) {
            tabActiva.classList.add('active');
            
            // Obtener info del día
            const fechaStr = tabActiva.getAttribute('data-fecha');
            const diaInfo = this.diasMostrados.find(d => d.id === diaId);
            
            if (diaInfo) {
                this.actualizarDiaActual(diaInfo);
                this.mostrarPartidosDelDia(diaInfo);
            }
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

// Hacer la función mostrarDia global para que funcione con onclick en HTML
window.mostrarDia = (diaId) => calendarioInicio.mostrarDia(diaId);

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        calendarioInicio.inicializar();
    });
} else {
    calendarioInicio.inicializar();
}
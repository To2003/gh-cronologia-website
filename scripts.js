const DATA_URL = 'data.json';
const JUGADORES_URL = 'jugadores.json';

const iconos = { eliminado: '✕', ingreso: '+', abandono: '↙', expulsado: '⚠' };
const labels  = { eliminado: 'Eliminado/a', ingreso: 'Ingresó', abandono: 'Abandonó', expulsado: 'Expulsado/a' };

let todosLosEventos = [];
let filtroActual = 'todos';

function initiales(nombre) {
    return nombre.split(' ').slice(0,2).map(p => p[0]).join('').toUpperCase();
}

const coloresAvatar = [
    { bg: '#EEEDFE', txt: '#3C3489' }, { bg: '#E1F5EE', txt: '#085041' },
    { bg: '#FAECE7', txt: '#712B13' }, { bg: '#E6F1FB', txt: '#0C447C' },
    { bg: '#FBEAF0', txt: '#72243E' }, { bg: '#FAEEDA', txt: '#633806' },
];

function colorAvatar(nombre) {
    let hash = 0;
    for (let c of nombre) hash = (hash * 31 + c.charCodeAt(0)) & 0xffff;
    return coloresAvatar[hash % coloresAvatar.length];
}

function formatFecha(str) {
    if (!str) return 'Sin fecha';
    const [y, m, d] = str.split('-').map(Number);
    const meses = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
    return `${d} ${meses[m-1]}`;
}

function renderPlaca(placa) {
    const grid = document.getElementById('placa-grid');
    if(!grid) return; 
    if (!placa || placa.length === 0) {
        grid.innerHTML = '<div class="vacio">No hay participantes en placa</div>';
        return;
    }
    grid.innerHTML = placa.map(p => {
        const col = colorAvatar(p.nombre);
        const ini = initiales(p.nombre);
        const razon = p.razon || 'votada';
        const razonLabel = { votada: 'votada/o', fulminado: 'fulminado/a', incumplimiento: 'incumplimiento' }[razon] || razon;
        return `
        <div class="placa-card">
            <div class="avatar" style="background:${col.bg};color:${col.txt}">${ini}</div>
            <div class="placa-info">
            <div class="placa-name">${p.nombre}</div>
            <span class="placa-razon ${razon}">${razonLabel}</span>
            </div>
        </div>`;
    }).join('');
}

function renderTimeline(eventos) {
    const tl = document.getElementById('timeline');
    if(!tl) return;
    const filtrados = filtroActual === 'todos' ? eventos : eventos.filter(e => e.tipo === filtroActual);
    if (filtrados.length === 0) {
        tl.innerHTML = '<div class="vacio">No hay eventos en esta categoría</div>';
        return;
    }
    tl.innerHTML = filtrados.map(e => {
        return `
        <div class="evento">
            <div class="evento-icono ${e.tipo}">${iconos[e.tipo] || '?'}</div>
            <div class="evento-body">
            <div class="evento-nombre">
                ${e.nombre}
                <span class="badge ${e.tipo}">${labels[e.tipo] || e.tipo}</span>
            </div>
            <div class="evento-detalle">${e.detalle || ''}</div>
            </div>
            <div class="evento-fecha">${formatFecha(e.fecha)}</div>
        </div>`;
    }).join('');
}

function procesarYRenderizarActivos(jugadoresBase, eventos) {
    let estadoJugadores = {};

    // 1. Cargamos a todos los del listado base asumiendo que entraron el Día 1
    jugadoresBase.forEach(j => {
        estadoJugadores[j.nombre] = {
            estado: 'activo',
            fechaIngreso: '2026-02-23',
            detalle: 'Ingresó el día 1'
        };
    });

    // 2. Ordenamos los eventos para procesar la historia en orden
    const eventosCronologicos = [...eventos].sort((a, b) => {
        if (!a.fecha) return 1;
        if (!b.fecha) return -1;
        return a.fecha.localeCompare(b.fecha);
    });

    // 3. Modificamos el estado y guardamos datos de nuevos ingresos
    eventosCronologicos.forEach(e => {
        if (e.tipo === 'ingreso') {
            // Si es un evento de ingreso genérico de todos, lo salteamos
            if (e.nombre.includes("Participantes") || e.nombre.includes(" y ")) return;
            
            estadoJugadores[e.nombre] = {
                estado: 'activo',
                fechaIngreso: e.fecha,
                detalle: e.detalle || 'Nuevo ingreso'
            };
        } else if (['eliminado', 'abandono', 'expulsado'].includes(e.tipo)) {
            if (estadoJugadores[e.nombre]) {
                estadoJugadores[e.nombre].estado = 'inactivo'; 
            }
        }
    });

    // 4. Filtramos solo a los que quedaron en 'activo'
    const jugadoresActivos = Object.keys(estadoJugadores).filter(nombre => estadoJugadores[nombre].estado === 'activo');

    // 5. Los dibujamos en el HTML
    const gridActivos = document.getElementById('jugadores-activos-grid');
    if (gridActivos) {
        if (jugadoresActivos.length === 0) {
            gridActivos.innerHTML = '<div class="vacio">No hay jugadores activos registrados</div>';
            return;
        }

        gridActivos.innerHTML = jugadoresActivos.map(nombre => {
            const data = estadoJugadores[nombre];
            const col = colorAvatar(nombre);
            const ini = initiales(nombre);
            const fechaFormateada = formatFecha(data.fechaIngreso);
            
            return `
            <div class="activo-card">
                <div class="avatar" style="background:${col.bg};color:${col.txt}">${ini}</div>
                <div class="activo-info">
                    <div class="activo-name">${nombre}</div>
                    <div class="activo-meta">📅 Ingreso: ${fechaFormateada}</div>
                    <div class="activo-meta detail">${data.detalle}</div>
                </div>
            </div>`;
        }).join('');
    }
}

function setFiltro(btn) {
    document.querySelectorAll('.filtro').forEach(b => b.classList.remove('activo'));
    btn.classList.add('activo');
    filtroActual = btn.dataset.filtro;
    renderTimeline(todosLosEventos);
}

async function cargarDatos() {
    try {
        const [resDatos, resJugadores] = await Promise.all([
            fetch(DATA_URL + '?t=' + Date.now()),
            fetch(JUGADORES_URL + '?t=' + Date.now())
        ]);

        if (!resDatos.ok) throw new Error(`HTTP data.json ${resDatos.status}`);
        if (!resJugadores.ok) throw new Error(`HTTP jugadores.json ${resJugadores.status}`);

        const data = await resDatos.json();
        const dataJugadores = await resJugadores.json();

        const tituloEl = document.getElementById('titulo');
        if(tituloEl) tituloEl.textContent = data.temporada || 'Gran Hermano';

        const fecha = new Date(data.ultima_actualizacion + 'T00:00:00');
        const opciones = { day: 'numeric', month: 'long', year: 'numeric' };
        const fechaFmt = fecha.toLocaleDateString('es-AR', opciones);
        
        const subEl = document.getElementById('subtitulo');
        if(subEl) subEl.textContent = `Última actualización: ${fechaFmt}`;

        renderPlaca(data.placa);
        todosLosEventos = (data.eventos || []).sort((a, b) => b.fecha.localeCompare(a.fecha));
        renderTimeline(todosLosEventos);

        procesarYRenderizarActivos(dataJugadores.jugadores, data.eventos);

    } catch (err) {
        const ec = document.getElementById('error-container');
        if(ec) {
            ec.innerHTML = `<div class="error-banner">Error al cargar los JSON. Asegurate de que ambos existan y estén en la misma carpeta. (${err.message})</div>`;
        }
        console.error(err);
    }
}

cargarDatos();
/*
    Carlos Tortosa Micó
    Trabajo final de Grado
    Grado en Tecnologías Interactivas

    18/03/2021
*/


// ---------------------------------------------
// SETUP INICIAL DE LEAFLET
let baseLayers = {
    "Base": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    })
}

let isocronasVisibles = false;

const elMapa = L.map('mapa', {
    zoomControl: false,
    minZoom: 2,
    layers: [baseLayers["Base"]]
});

elMapa.on('click', (e) => {
    setSelectionMode(false);
})

L.control.layers(baseLayers).addTo(elMapa);

L.control.zoom({
    position: 'topright'
}).addTo(elMapa);

elMapa.setView([39, -0.6], 10);
// ---------------------------
const enlaceABackend = new EnlaceABackend();
// ---------------------------
const entityTypes = {
    Vehiculo: [
        'SVA',
        'SVB',
    ],
    Map: [
        'Base'
    ]
}
// ---------------------------
let overlapCandidates = [];
let currentOverlap = null;

let lastBaseClicked = null;
let selectionMode = false;
// ---------------------------
let entidadesMapa = {
    SVA: [],
    SVB: [],
    Base: []
}
// --------------------------
let tiempoDeIsocronas = 15;
let tiempoLabel = document.getElementById('cantidadDeTiempoIsocrona');

let sliderTiempoIsocronas = document.getElementById('sliderTiempo');

sliderTiempoIsocronas.oninput = (ev) => {
    let tiempo = sliderTiempoIsocronas.value;
    tiempoLabel.innerHTML =  tiempo + ' min';
}

sliderTiempoIsocronas.onchange = (ev) => {
    tiempoDeIsocronas = parseInt(sliderTiempoIsocronas.value);
    updateTiempoDeIsocronas(parseInt(sliderTiempoIsocronas.value));
}
// --------------------------

getDatos('SVA', (res, err) => {
    if (err) {
        console.error(err);
        return;
    }

    res.forEach((vehiculoData) => {
        let vehiculo = new Vehiculo(
            vehiculoData.Lat,
            vehiculoData.Lng,
            'SVA',
            vehiculoData.Disponibilidad,
            10,
            elMapa,
            vehiculoData.Descripcion
        );
        vehiculo.marcador.on('dragend', (e) => {
            onIsochroneMoved(e, vehiculo)
        });
        entidadesMapa.SVA.push(vehiculo);
    });
});

getDatos('SVB', (res, err) => {
    if (err) {
        console.error(err);
        return;
    }

    res.forEach((vehiculoData) => {
        let vehiculo = new Vehiculo(
            vehiculoData.Lat,
            vehiculoData.Lng,
            'SVB',
            vehiculoData.Disponibilidad,
            10,
            elMapa,
            vehiculoData.Descripcion
        );
        vehiculo.marcador.on('dragend', (e) => {
            onIsochroneMoved(e, vehiculo)
        });
        entidadesMapa.SVB.push(vehiculo);
    });
});

getDatos('Base', (res, err) => {
    if (err) {
        console.error(err);
        return;
    }

    res.forEach((baseData) => {
        let base = new Base(baseData.Lat, baseData.Lng, baseData.Descripcion, elMapa);

        entidadesMapa.Base.push(base);
    });
});


/**
 * Realiza una petición al backend para sustraer los datos
 * referidos a un tipo de entidad del mapa
 * @param {string} tipo Tipo de entidad del mapa 
 * @param {function} callback Callback para resultados
 */
function getDatos(tipo = 'SVA', callback) {
    enlaceABackend.getVehiculos(tipo, (datos, error) => {
        callback(datos, error);
    })
}

/**
 * Evento disparado al arrastrar marcador
 * @param {IsochroneEntity} isochroneEntity
 */
function onIsochroneMoved(e, isochroneEntity) {
    if (!overlapCandidates.includes(isochroneEntity)) {
        overlapCandidates.push(isochroneEntity);
    }

    // De momento solo nos interesa realizar la
    // comparación entre dos isócronas
    overlapCandidates = overlapCandidates.slice(-2, undefined);

    isochroneEntity.onDragMarcador((e), (isocrona) => {
        if (currentOverlap !== null) currentOverlap.hide();

        // No queremos realizar el cálculo si lo que ha ocurrido
        // es que el usuario ha movido el mismo marcador dos veces
        if (overlapCandidates.length === 2) {
            let overlapGeometry = overlapCandidates[0].checkSolapeCon(overlapCandidates[1]);

            if (overlapGeometry) {
                currentOverlap = new Overlap(overlapGeometry, elMapa);
                currentOverlap.show();
            }
        }
    });

}

function toggleIsocronas(e) {
    if (currentOverlap) currentOverlap.hide();

    isocronasVisibles = !isocronasVisibles;

    Object.keys(entidadesMapa).forEach((tipo) => {
        if (tipo === 'SVA' || tipo === 'SVB') {
            entidadesMapa[tipo].forEach((entidad) => {
                entidad.setVisibilidadIsocrona(isocronasVisibles);
            })
        }
    })
}

function extraerVehiculo() {
    if (lastBaseClicked) {
        lastBaseClicked.extraerVehiculo();
    }
}

function anyadirVehiculo(vehiculo) {
    if (lastBaseClicked) {
        lastBaseClicked.anyadirVehiculo(vehiculo);
    }
}

function setSelectionMode(selecting) {
    selectionMode = selecting; 
}

/**
 * Actualiza las entidades del mapa con el nuevo tiempo de isocrona
 * @param {number} tiempo Nuevo tiempo de las isocronas
 */
function updateTiempoDeIsocronas(tiempo) {
    Object.keys(entidadesMapa).forEach((subseccion) => {

        // TODO: Considerar cambiar este if statement por algo
        // del estilo if (subseccion !== "Base")
        if (subseccion === "SVA" || subseccion === "SVB") {
            entidadesMapa[subseccion].forEach((vehiculo) => {
                vehiculo.tiempoDeIsocrona = tiempo;
                if (vehiculo.tieneIsocrona()) {
                    vehiculo.actualizarIsocrona(tiempo, (res, err) => {
                        if (err) console.error(err);
                    });
                }
            });
        };
    });
}
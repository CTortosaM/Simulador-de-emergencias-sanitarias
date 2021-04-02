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
// ---------------------------
let entidadesMapa = {
    SVA: [],
    SVB: [],
    Base: []
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
            10,
            elMapa
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
            10,
            elMapa
        );
        vehiculo.marcador.on('dragend', (e) => {
            onIsochroneMoved(e, vehiculo)
        });
        entidadesMapa.SVB.push(vehiculo);
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

    Object.keys(entities).forEach((key) => {
        entities[key].forEach((entity) => {
            switch (entity.tipo) {
                case 'SVA':
                    entity.hideIsocrona();
                    break;
            }
        })
    })
}
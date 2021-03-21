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
const entityTypes = {
    Isochrone: [
        'SVA',
        'SVB',
        'Interseccion'
    ],
    Map: [
        'Base'
    ]
}
// ---------------------------
let overlapCandidates = [];
let currentOverlap = null;
// ---------------------------

/**
 * Realiza el setup de marcadores de todas las entidades
 * del tipo proporcionado
 * @param {string} tipo 
 */
const setupEntity = (tipo) => {
    getDatos(tipo, (resultados, error) => {

        // Si pasa algo mejor lo dejamos estar
        if (error) {
            console.error(error);
            return;
        }

        if (resultados) {
            resultados.forEach((resultado) => {
                if (entityTypes.Isochrone.includes(tipo)) {

                    let isochroneEntity = new IsochroneEntity(
                        resultado.Lat,
                        resultado.Lng,
                        tipo,
                        10,
                        elMapa
                    );

                    // Habilitamos por defecto el arrastrado de los marcadores
                    // para realizar la simulación de las isócronas
                    isochroneEntity.setDraggableMarker(true);
                    isochroneEntity.marcador.on('dragend', (e) => {
                        onIsochroneMoved(e, isochroneEntity);
                    })

                } else if (entityTypes.Map.includes(tipo)) {
                    entities[tipo].push(new MapEntity(
                        resultado.Lat,
                        resultado.Lng,
                        tipo,
                        'medkit',
                        'pink',
                        elMapa
                    ));
                }
            });
        }
    });
}
// ----------------------------
let entities = {
    SVA: [],
    SVB: [],
    Base: []
}
// ----------------------------
setupEntity('SVA');
setupEntity('SVB');
setupEntity('Base');



/**
 * Realiza una petición al backend para sustraer los datos
 * referidos a un tipo de entidad del mapa
 * @param {string} tipo Tipo de entidad del mapa 
 * @param {function} callback Callback para resultados
 */
function getDatos(tipo = 'SVA', callback) {
    eel.getDatos(tipo)().then((results) => {
        if (results === 'Wrong data') {
            callback(null, 'Petición incorrecta');
            return;
        }
        callback(JSON.parse(results), null);
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
            console.log(overlapGeometry);

            if (overlapGeometry) {
                currentOverlap = new Overlap(overlapGeometry, elMapa);
                currentOverlap.show();
            }
        }
    });

}
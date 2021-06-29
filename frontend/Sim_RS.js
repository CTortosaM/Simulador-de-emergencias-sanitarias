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

let pointersSVA = L.layerGroup();
let poinersSVB = L.layerGroup();
let pointersBases = L.layerGroup();

let isocronasVisibles = false;

const elMapa = L.map('mapa', {
    zoomControl: false,
    minZoom: 2,
    layers: [baseLayers["Base"]]
});

elMapa.on('click', (e) => {
    setSelectionMode(false);
})



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
    tiempoLabel.innerHTML = tiempo + ' min';
}

sliderTiempoIsocronas.onchange = (ev) => {
    tiempoDeIsocronas = parseInt(sliderTiempoIsocronas.value);
    updateTiempoDeIsocronas(parseInt(sliderTiempoIsocronas.value));
}

let botonToggleIsocronas = document.getElementById('botonToggleIsocronas');
// --------------------------

let overlays = {
    "SVA": pointersSVA,
    "SVB": poinersSVB,
    "Bases": pointersBases
}

// --------------------------
// Controles del mapa
// --------------------------
desactivarControles();
L.control.layers(baseLayers, overlays).addTo(elMapa);

// --------------------------
// Carga las bases
// Ahora cargamos las bases, que son permanentes
getDatos('Base', (res, err) => {
    if (err) {
        console.error(err);
        return;
    }

    res.forEach((baseData) => {
        let base = new Base(baseData.Lat, baseData.Lng, baseData.Descripcion, elMapa);
        base.marcador.addTo(pointersBases);
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


function getDatos_CSV(callback) {
    enlaceABackend.getVehiculos_CSV((datos, error) => {
        callback(datos, error);
    })
}

/**
 * Activa los elementos del panel de control referidos
 * a las isocronas
 */
function activarControles() {
    sliderTiempoIsocronas.disabled = false;
    botonToggleIsocronas.classList.replace("btn-secondary", "btn-primary")
    botonToggleIsocronas.disabled = false;
}


/**
 * Desactiva los controles referidos a la isocronas del panel de contol
 */
function desactivarControles() {
    sliderTiempoIsocronas.disabled = true;
    botonToggleIsocronas.disabled = true;
}

function cargarFicheroCSVdeVehiculos() {

    let input = document.createElement('input');
    input.type = 'file';

    input.onchange = (e) => {
        let file = e.target.files[0];

        const extension = file.name.split('.').pop();
        
        if (extension !== 'csv') {
            setErrorMessageExtensionFichero(true, 'mensajeAlertaExtension');
            return;
        }

        Papa.parse(file, {
            header: true,
            complete: function (res) {
                if (res.errors.length > 0) {
                    res.errors.forEach((error) => {
                        console.error(error.message);
                    })

                    setErrorMessageExtensionFichero(true, 'mensajeAlertaExtension');
                    return;
                }

                let losDatos = {
                    SVA: [],
                    SVB: []
                }

                try {
                    res.data.forEach((vehiculo) => {
                        if (vehiculo.Tipo == 'SVA') {
                            losDatos.SVA.push(vehiculo);
                        } else {
                            losDatos.SVB.push(vehiculo);
                        }
                    });
                } catch (error) {
                    setErrorMessageExtensionFichero(true);
                    console.error(error);
                    return;
                }

                setErrorMessageExtensionFichero(false ,'mensajeAlertaExtension');
                resetPage();
                cargarDatos(losDatos);
                activarControles();

                document.getElementById('botonCargarFicheroCSV').innerHTML = "Cargar datos nuevos";

            }
        })
    }

    input.click();
}

function cargarDatos(datos) {

    let losSVA = datos['SVA'];
    let losSVB = datos['SVB'];

    losSVA.forEach((sva) => {
        let vehiculo = new Vehiculo(
            sva.Lat,
            sva.Lng,
            'SVA',
            sva.Disponibilidad,
            tiempoDeIsocronas,
            elMapa,
            sva.Descripcion
        );

        vehiculo.marcador.on('dragend', (e) => {
            onIsochroneMoved(e, vehiculo)
        });

        vehiculo.marcador.addTo(pointersSVA);
        entidadesMapa.SVA.push(vehiculo);
    });

    losSVB.forEach((svb) => {
        let vehiculo = new Vehiculo(
            svb.Lat,
            svb.Lng,
            'SVB',
            svb.Disponibilidad,
            tiempoDeIsocronas,
            elMapa,
            svb.Descripcion
        );

        vehiculo.marcador.on('dragend', (e) => {
            onIsochroneMoved(e, vehiculo)
        });

        vehiculo.marcador.addTo(poinersSVB);
        entidadesMapa.SVB.push(vehiculo);
    });

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

function loadArrayBuffer(e) {
    // e.target.result === reader.result
    shp(e.target.result).then(function (geojson) {
        try {
            L.geoJSON(geojson, {}).addTo(elMapa);
        } catch (error) {
            console.error(error);
            setErrorMessageExtensionFichero(true, 'mensajeAlertaShapeFile');
        }
    }).catch(function (err) {
        setErrorMessageExtensionFichero(true, 'mensajeAlertaShapeFile');
        console.error(err);
    });

    setErrorMessageExtensionFichero(false, 'mensajeAlertaShapeFile');
}

function onSubirShapeFile() {
    let input = document.createElement('input');
    input.type = 'file'
    input.onchange = function (e) {
        let file = e.target.files[0];

        let reader = new FileReader();
        reader.onload = loadArrayBuffer;
        reader.readAsArrayBuffer(file);

    }
    input.click();
}


function resetPage() {

    // Elimina los vehiculos del mapa
    Object.keys(entidadesMapa).forEach((tipo) => {
        entidadesMapa[tipo].forEach((entidad) => {
            if (tipo === 'SVA' || tipo === 'SVB') {
                entidad.destruir();
            }
        })
    });

    // Restablece controles
    tiempoDeIsocronas = 15;
    sliderTiempoIsocronas.value = 15;
    tiempoLabel.innerHTML = 15 + ' min';

    if (currentOverlap) currentOverlap.hide();
    currentOverlap = null;

    isocronasVisibles = false;

    entidadesMapa = {
        SVA: [],
        SVB: [],
        Base: entidadesMapa.Base
    };
}

/**
 * Activa o desactiva el mensaje de error de extensión de fichero
 * @param {boolean} hayError 
 */
function setErrorMessageExtensionFichero(hayError, id) {
    let mensaje = document.getElementById(id);

    if (hayError) {
        mensaje.classList.remove('invisible');
    } else {
        mensaje.classList.add('invisible');
    }
}
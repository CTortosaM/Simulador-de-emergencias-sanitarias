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

let DOCUMENTO_CARGADO = false;

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

let capasShapeFile = [];
// --------------------------
let tiempoDeIsocronas = 15;
let tiempoLabel = document.getElementById('cantidadDeTiempoIsocrona');

let sliderTiempoIsocronas = document.getElementById('sliderTiempo');

sliderTiempoIsocronas.oninput = (ev) => {
    let tiempo = sliderTiempoIsocronas.value;
    tiempoLabel.innerHTML = tiempo + ' min';
}

sliderTiempoIsocronas.onchange = (ev) => {
    if (currentOverlap) currentOverlap.hide();
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


// INPUT CSVs
document.getElementById('ElInputDeCSV').onchange = onArchivoRecibidoEnInputCSV;

// --------------------------
// Cargamos las bases, que son datos permanentes
enlaceABackend.getBases_DB((err, res) => {
    if (err) {
        console.error(err);
        return;
    }

    res.forEach((baseData) => {
        let base = new Base(baseData.Lat, baseData.Lng, baseData.Descripcion, elMapa);
        base.marcador.addTo(pointersBases);
        entidadesMapa.Base.push(base);
    });

    DOCUMENTO_CARGADO = true;
})

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

/**
 * Función disparada del evento click cargar CSV.
 * 
 */
function cargarFicheroCSVdeVehiculos() {

    let input = document.getElementById("ElInputDeCSV");
    //input.type = 'file';
    input.click();
}

/**
 * Función inicial de carga de datos
 * @param {object} datos 
 */
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

        vehiculo.marcador.on('click', (e) => {
            onIsochroneMoved(e.latlng, vehiculo)

            if (overlapCandidates.includes(vehiculo)) {
                if (currentOverlap) {
                    let visible1 = overlapCandidates[0].esLaIsocronaVisible();
                    let visible2 = overlapCandidates[1].esLaIsocronaVisible();

                    if (!visible1 || !visible2) {
                        currentOverlap.hide();
                    }
                }
            }
        });

        vehiculo.marcador.on('dragstart', (e) => {
            vehiculo.setVisibilidadIsocrona(false);
            if (overlapCandidates.includes(vehiculo) && currentOverlap !== null) {
                currentOverlap.hide();
            }
        })

        vehiculo.marcador.on('dragend', (e) => {
            let nuevaPosicion = e.target._latlng;
            vehiculo.desplazarA(nuevaPosicion.lat, nuevaPosicion.lng);
            vehiculo.isocrona = null;
        })

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

        vehiculo.marcador.on('click', (e) => {
            onIsochroneMoved(e.latlng, vehiculo)

            if (overlapCandidates.includes(vehiculo)) {
                if (currentOverlap) {
                    let visible1 = overlapCandidates[0].esLaIsocronaVisible();
                    let visible2 = overlapCandidates[1].esLaIsocronaVisible();

                    if (!visible1 || !visible2) {
                        currentOverlap.hide();
                    }
                }
            }
        });

        vehiculo.marcador.on('dragstart', (e) => {
            vehiculo.setVisibilidadIsocrona(false);
            if (overlapCandidates.includes(vehiculo) && currentOverlap !== null) {
                currentOverlap.hide();
            }
        })

        vehiculo.marcador.on('dragend', (e) => {
            let nuevaPosicion = e.target._latlng;
            vehiculo.desplazarA(nuevaPosicion.lat, nuevaPosicion.lng);
            vehiculo.isocrona = null;
        })

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

/**
 * Alterna la visibilidad de las isócronas
 * @param {event} e Evento click del botón html
 */
function toggleIsocronas(e) {
    if (currentOverlap) {
        currentOverlap.hide();
    }
    let flag = true;
    isocronasVisibles = !isocronasVisibles;

    Object.keys(entidadesMapa).forEach((tipo) => {
        if (tipo === 'SVA' || tipo === 'SVB') {
            for (let i = 0; i < entidadesMapa[tipo].length; i++) {
                if (entidadesMapa[tipo][i].esLaIsocronaVisible()) {
                    flag = false;
                }
            }

            for (let i = 0; i < entidadesMapa[tipo].length; i++) {
                entidadesMapa[tipo][i].setVisibilidadIsocrona(flag);
                if (currentOverlap && flag) currentOverlap.show();
            }
        }
    })

}

/**
 * Notifica a la base que extraiga un vehículo
 */
function extraerVehiculo() {
    if (lastBaseClicked) {
        lastBaseClicked.extraerVehiculo();
    }
}


/**
 * Notificar a la base que añada el vehiculo del parámetro
 * @param {Vehiculo} vehiculo 
 */
function anyadirVehiculo(vehiculo) {
    if (lastBaseClicked) {
        lastBaseClicked.anyadirVehiculo(vehiculo);

        if (overlapCandidates.includes(vehiculo) && currentOverlap) {
            currentOverlap.hide();
            currentOverlap = null;
        }
    }
}

/**
 * Seleccionar si nos encontramos en modo selección de vehículos
 * @param {boolean} selecting 
 */
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


/**
 * Función evento para cuando se pulsa el botón
 * subir shapefile
 */
function onSubirShapeFile() {
    let input = document.createElement('input');
    input.type = 'file'
    input.onchange = function (ev) {

        let file = ev.target.files[0];
        const nombreFile = file.name;

        let reader = new FileReader();
        reader.onload = function (e) {
            let capaGeoJson = null;
            shp(e.target.result).then(function (geojson) {
                try {

                    capaGeoJson = L.geoJSON(geojson, {});
                    setErrorMessageExtensionFichero(false, 'mensajeAlertaShapeFile');

                    anyadirCapaShapefile(nombreFile, capaGeoJson);

                } catch (error) {
                    console.error(error);
                    setErrorMessageExtensionFichero(true, 'mensajeAlertaShapeFile');
                    return;
                }
            }).catch(function (err) {
                setErrorMessageExtensionFichero(true, 'mensajeAlertaShapeFile');
                console.error(err);
                return;
            });
        };
        reader.readAsArrayBuffer(file);
    }

    input.click();
}

/**
 * Añade la capa shapefile al registro y el mapa
 * @param {string} nombreShapefile 
 * @param {object} capa 
 */
function anyadirCapaShapefile(nombreShapefile, capa) {
    let sanitizedName = sanitizeString(nombreShapefile);
    let tenemosLaCapa = elShapeFileYaEstaEnElMapa('elementoCapa' + sanitizedName);

    // Puesto que vamos a incorporar el nombre al DOM, realizamos una limpieza
    // de carácteres especiales para evitar las inyecciones

    if (!tenemosLaCapa) {
        capasShapeFile.push({
            FileName: nombreShapefile,
            SanitizedName: 'elementoCapa' + sanitizedName,
            GeoJson: capa
        });
        capa.addTo(elMapa);
        crearElementoHTMLCapa(sanitizedName);
    }
}

/**
 * Elimina los elementos no alphanumericos del string
 * @param {string} input String al cual hacer sanitizing
 */
function sanitizeString(input) {
    input = input.replace('zip', '');
    return input.replace(/\W/g, '');
}

/**
 * Añade a la lista de capas un elemento capa que se puede eliminar
 * interactuando con el botón
 * @param {string} nombre ID para el elemento HTML
 */
function crearElementoHTMLCapa(nombre) {
    let elemento = `<li class="list-group-item capaDeLaLista" id="elementoCapa${nombre}">
    <div class="card cardCapa">
        <div class="card-body cuerpoCardCapa">
            <p class="col-10">${nombre}</p>
            <button  class="btn btn-light col-2" id="elementoCapaBoton${nombre}">
                <i class="far fa-trash-alt"></i>
            </button>
        </div>
    </div>
</li>`
    try {
        const lista = document.getElementById('listaDeCapas');
        lista.insertAdjacentHTML('beforeend', elemento);
        let elElementoAnyadido = document.getElementById('elementoCapaBoton' + nombre);

        elElementoAnyadido.addEventListener('click', (e) => {


            for (let i = 0; i < capasShapeFile.length; i++) {
                if (capasShapeFile[i].SanitizedName === 'elementoCapa' + nombre) {

                    let elementoPadre = document.getElementById('elementoCapa' + nombre);
                    elementoPadre.parentNode.removeChild(elementoPadre);

                    // Quitamos la capa del mapa
                    elMapa.removeLayer(capasShapeFile[i].GeoJson);

                    // Eliminamos el registro de la capa
                    capasShapeFile.splice(capasShapeFile.indexOf(capasShapeFile[i]), 1);
                    return;
                }
            }
        });

    } catch (e) {
        console.error(e);
    }
}


/**
 * ¿Está el shapefile ya en el mapa? Esta función te lo dice
 * @param {string} nombreShapefile 
 * @returns {boolean} Boolean
 */
function elShapeFileYaEstaEnElMapa(nombreShapefile) {

    for (let i = 0; i < capasShapeFile.length; i++) {
        if (capasShapeFile[i].SanitizedName === nombreShapefile) {
            return true;
        }
    }
    return false;
}

/**
 * Elimina todos los vehículos e isócronas del mapa
 */
function resetPage() {

    // Elimina los vehiculos del mapa
    Object.keys(entidadesMapa).forEach((tipo) => {
        entidadesMapa[tipo].forEach((entidad) => {
            if (tipo === 'SVA' || tipo === 'SVB') {
                entidad.destruir();
            }
        })
    });

    overlapCandidates = [];

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

/**
 * Función de procesado de archivo CSV para cargar vehiculos
 * @param {event} e Evento onChange del input archivos 
 */
function onArchivoRecibidoEnInputCSV(e) {

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

            setErrorMessageExtensionFichero(false, 'mensajeAlertaExtension');
            resetPage();
            cargarDatos(losDatos);
            activarControles();

            document.getElementById('botonCargarFicheroCSV').innerHTML = "Cargar datos nuevos";

        }
    })
}
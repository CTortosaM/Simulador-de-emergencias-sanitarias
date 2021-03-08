/*
    Carlos Tortosa Micó
    Trabajo final de Grado
    Grado en Tecnologías Interactivas

    14/12/2020
*/
// LEAFLET
//var sideBar = L.control.sidebar('sidebar').addTo(elMapa);
let pointersSVA = L.layerGroup();
let pointersSVB = L.layerGroup();
let pointersBases = L.layerGroup();
let isocronas = {};

let marcadores = [];
let marcadoresSolape = [];

let joinMarcadoresSolapes = [];

let isocronasSolapadas = [];
let intersecciones = [];

let baseLayers = {
    "Base": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    })
}

getDatos("SVA");
getDatos("SVB");
getDatos("Base");

let overlays = {
    "SVA": pointersSVA,
    "SVB": pointersSVB,
    "Bases": pointersBases
}

// Colores para las isócronas
const coloresIsocronas = {
    "SVA": "#e61212",
    "SVB": "#129fe6",
    "Base": "#e630af",
    "Seleccionable": "#d99725",
    "Intersecciones": "#000000"
}

// Marcadores
let marcadorSVA = L.AwesomeMarkers.icon({
    icon: 'ambulance',
    markerColor: 'red',
    prefix: 'fa'
});

let marcadorSVB = L.AwesomeMarkers.icon({
    icon: 'ambulance',
    markerColor: 'blue',
    prefix: 'fa'
})

let marcadorBase = L.AwesomeMarkers.icon({
    icon: 'medkit',
    markerColor: 'pink',
    prefix: 'fa'
})

let marcadorSolape = L.AwesomeMarkers.icon({
    icon: 'layer-group',
    markerColor: 'green',
    prefix: 'fa'
});

let iconoIsocrona = L.AwesomeMarkers.icon({
    icon: "clock",
    markerColor: 'orange',
    prefix: 'fa'
})



const elMapa = L.map('mapa', {
    zoomControl: false,
    minZoom: 2,
    layers: [baseLayers["Base"], pointersSVA, pointersSVB, pointersBases]
});

// ------------------------------------------------------------------------

L.control.zoom({
    position: 'topright'
}).addTo(elMapa);

elMapa.on('click', (event => {
    let coord = event.latlng;
    obtenerGeoJson(coord.lat, coord.lng, "isocrona", coloresIsocronas.Seleccionable).then((json) => {
        try {

            isocronas[coord.lat + '/' + coord.lng] = {};
            isocronas[coord.lat + '/' + coord.lng].isocrona = json;
            json.addTo(elMapa);

            let nuevasCoords = new L.LatLng(coord.lat, coord.lng);
            marcadorIsocrona.setLatLng(nuevasCoords);

        } catch (errorAlAñadirJson) {
            console.error(errorAlAñadirJson);
        }
    });
    //if (json) json.addTo(elMapa);
}));
L.control.layers(baseLayers, overlays).addTo(elMapa);

let marcadorIsocrona = L.marker([39, -0.6], {
    icon: iconoIsocrona
});
marcadorIsocrona.addTo(elMapa);

let tiempoDeIsocrona = 15;
let todasLasIsocronasVisibles = false;
todasLasIsocronasVisibles.add

let sliderDeTiempo = document.getElementById("sliderTiempo");
let cantidadDeTiempoIsocrona = document.getElementById("cantidadDeTiempoIsocrona");
sliderDeTiempo.value = 15;

sliderDeTiempo.oninput = (ev) => {
    tiempoDeIsocrona = parseInt(sliderDeTiempo.value);
    cantidadDeTiempoIsocrona.innerText = tiempoDeIsocrona + " min";
}

sliderDeTiempo.onchange = (ev) => {
    isocronas = {};
    intersecciones = [];
    eliminarCapa('marcador');
    eliminarCapa('Interseccion');
}
// ------------------------------------------------

function poblarConIsocronas() {
    marcadores.forEach((marcador) => {
        marcador.fire('click');
    })
}

/**
 * Evento onClick de los marcadores
 * @param {number} lat Latitud del punto
 * @param {number} lng Longitud del punto
 * @param {String} tipo Tipo de marcador ("SVA", "SVB", "Base")
 */
// ---------------
const onClickMarcador = (lat, lng, tipo) => {
    if (!isocronas[lat + '/' + lng]) {
        obtenerGeoJson(lat, lng, "marcador", coloresIsocronas[tipo]).then((json) => {
            try {
                isocronas[lat + '/' + lng] = {};
                isocronas[lat + '/' + lng].isocrona = json;
                isocronas[lat + '/' + lng].visible = true;
                json.addTo(elMapa);
            } catch (error) {
                console.error(error);
            }
        })
    } else {
        if (isocronas[lat + '/' + lng].visible) {
            elMapa.removeLayer(isocronas[lat + '/' + lng].isocrona);
            isocronas[lat + '/' + lng].visible = false;
        } else {
            comprobarSolape(isocronas[lat + '/' + lng].isocrona);
            isocronas[lat + '/' + lng].isocrona.addTo(elMapa);
            isocronas[lat + '/' + lng].visible = true;
        }
    }
}

/**
 * Función para el proceso de colocar marcador, calcular
 * estimación de la población, etc.
 * @param {object} geojson 
 * @param {object} ev 
 */
async function onClickInterseccion(geojson) {

    let estimacion = await eel.getEstimacionPoblacion(geojson.geometry.coordinates[0])();
    
    return estimacion.results[0].value.estimates['gpw-v4-population-count-rev10_2020']['SUM'];
}

/**
 * 
 */
async function obtenerCoordsEPSG() {
    let coords = await eel.obtenerCoordsEPSG()();
    coords = JSON.parse(coords);
    elMapa.setView([coords.long, coords.lat], 10);
}

/**
 * 
 * @param {number} lng 
 * @param {number} lat 
 * @param {String} tag 
 * @param {String} color
 * @returns {GeoJson} layer
 */
async function obtenerGeoJson(lng, lat, tag, color) {
    // Elimina las capas
    elMapa.eachLayer((layer) => {
        if (layer.myTag && layer.myTag == "isocrona") {
            elMapa.removeLayer(layer);
        }
    });


    let geojsonHTTP = await eel.obtenerGeoJson(lng, lat, tiempoDeIsocrona)();
    let geoJson = L.geoJSON(geojsonHTTP, {
        onEachFeature: function (feature, layer) {
            layer.myTag = tag
        },
        style: {
            color: color
        }
    });

    geoJson.on('click', (e) => {
        L.DomEvent.stop(e);
        //console.log(e.layer);
        comprobarSolape(e.layer.feature);
    });
    return geoJson;

    //let nuevasCoords = new L.LatLng(lng, lat);
    //marcadorIsocrona.setLatLng(nuevasCoords);
}

/**
 * Añade el layer al array de solapes y realiza la
 * comprobación con el layer ya presente en el array
 * @param {object} layer 
 */
function comprobarSolape(layer) {

    if (isocronasSolapadas.length > 1) {
        intersecciones = [];
        isocronasSolapadas[0] = isocronasSolapadas[1];
        isocronasSolapadas[1] = layer;
    } else {
        isocronasSolapadas.push(layer);
    }

    if (isocronasSolapadas[0] == isocronasSolapadas[1]) return;

    try {

        let interseccion = turf.intersect(isocronasSolapadas[0], isocronasSolapadas[1]);
        if (interseccion) {
            intersecciones = [];
            eliminarCapa("Interseccion");
            let interseccionGeoJson = L.geoJSON(interseccion , {
                onEachFeature: (feature, layer) => {
                    layer.myTag = "Interseccion"
                },
                style: {
                    color: '#0cf533'
                }
            });

            // Calcula el centro de la intersección para poder
            // colocar el marcador
            let centroGeoJson = turf.center(interseccion).geometry.coordinates;
            let lat = centroGeoJson[1];
            centroGeoJson[1] = centroGeoJson[0];
            centroGeoJson[0] = lat;
            
            // Elimina los marcadores anteriores
            marcadoresSolape.forEach((marcadorS) => {
                elMapa.removeLayer(marcadorS);
            })

            marcadoresSolape = [];
            // Coloca el marcador
            let marcador = new L.marker(centroGeoJson, {
                icon: marcadorSolape
            });

            marcador.bindPopup('<p>Placeholder</p>')
            marcador.on('click', (ev) => {
                let popup = ev.target.getPopup();
                popup.setContent('<p>Cargando...</p>');

                onClickInterseccion(interseccion).then((poblacion) => {
                    popup.setContent(`
                    <p>${poblacion} <i class="fas fa-user"></i></p>
                    `)
                })
            })
            marcador.addTo(elMapa);

            marcadoresSolape.push(marcador);

            /* interseccionGeoJson.on('click', (ev) => {
                onClickInterseccion(interseccion, ev);
            }); */

            intersecciones.push(interseccionGeoJson);
            interseccionGeoJson.addTo(elMapa);

            joinMarcadoresSolapes.push([marcador, interseccionGeoJson]);
        }
    } catch(error) {
        console.error(error);
    }

}



async function getDatos(tipo) {
    let datosVehiculos = await eel.getDatos(tipo)();

    if (!datosVehiculos) return;

    let lista = JSON.parse(datosVehiculos);

    lista.forEach(place => {
        let contenidoMarcador = `
             <b>
                 ${place.Descripcion}
             </b>
        `;

        if (tipo === "SVA" || tipo === "SVB") {
            contenidoMarcador += `
                <p>
                    Disponibilidad: ${place.Disponibilidad}
                </p>
            `
        };

        let marker;


        switch (tipo) {
            case "SVA":
                marker = L.marker([place.Lat, place.Lng], {
                    icon: marcadorSVA
                }).bindPopup(contenidoMarcador);
                marker.addTo(pointersSVA).on('click', function () {
                    onClickMarcador(place.Lat, place.Lng, "SVA")
                });
                marcadores.push(marker);
                break;

            case "SVB":
                marker = L.marker([place.Lat, place.Lng], {
                    icon: marcadorSVB
                }).bindPopup(contenidoMarcador);
                marker.addTo(pointersSVB).on('click', function () {
                    onClickMarcador(place.Lat, place.Lng, "SVB")
                });
                marcadores.push(marker);
                break;

            case "Base":
                marker = L.marker([place.Lat, place.Lng], {
                    icon: marcadorBase
                }).bindPopup(contenidoMarcador);
                marker.addTo(pointersBases).on('click', function () {
                    onClickMarcador(place.Lat, place.Lng, "Base")
                });
                marcadores.push(marker);
                break;
        }

        

    });
}

function toggleIsocronas() {
    todasLasIsocronasVisibles = !todasLasIsocronasVisibles;
    eliminarCapa('Interseccion');

    intersecciones = [];

    capas = Object.keys(isocronas);

    if (capas.length < marcadores.length) poblarConIsocronas();

    if (!todasLasIsocronasVisibles) {

        marcadoresSolape.forEach((m) => {
            elMapa.removeLayer(m);
        })

        marcadoresSolape = [];

        capas.forEach((capa) => {
            if (elMapa.hasLayer(isocronas[capa].isocrona)) {
                elMapa.removeLayer(isocronas[capa].isocrona);
                isocronas[capa].visible = false;
            }
        })
    } else {
        capas.forEach((capa) => {
            if (!elMapa.hasLayer(isocronas[capa].isocrona)) {
                isocronas[capa].isocrona.addTo(elMapa);
                isocronas[capa].visible = true;
            }
        })
    }
}


/**
 * Elimina del mapa todas las capas con el tag
 * @param {string} tag Tag para la capa
 */
function eliminarCapa(tag) {
    elMapa.eachLayer((layer) => {
        if (layer.myTag === tag) {
            elMapa.removeLayer(layer);
        }
    })
}
obtenerCoordsEPSG();
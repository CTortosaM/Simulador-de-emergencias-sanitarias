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
let isocronas = [];

let marcadores = [];

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

let iconoIsocrona = L.AwesomeMarkers.icon({
    icon: "clock",
    markerColor: 'orange',
    prefix: 'fa'
})



const elMapa = L.map('mapa', {
    zoomControl: false,
    minZoom: 7,
    layers: [baseLayers["Base"], pointersSVA, pointersSVB, pointersBases]
});

// ------------------------------------------------------------------------

L.control.zoom({
    position: 'topright'
}).addTo(elMapa);

elMapa.on('click', (event => {
    let coord = event.latlng;
    obtenerGeoJson(coord.lat, coord.lng, "isocrona").then((json) => {
        try {

                isocronas.push(json);
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

let sliderDeTiempo = document.getElementById("sliderTiempo");
let cantidadDeTiempoIsocrona = document.getElementById("cantidadDeTiempoIsocrona");
sliderDeTiempo.value = 15;

sliderDeTiempo.oninput = (ev) => {
    tiempoDeIsocrona = parseInt(sliderDeTiempo.value);
    cantidadDeTiempoIsocrona.innerText = tiempoDeIsocrona + " min";
}
// ---------------
const onClickMarcador = (lat, lng) => {
    obtenerGeoJson(lat,lng, "marcador").then((json) => {
        try {
            json.addTo(elMapa);
        } catch (error) {
            console.error(error);
        }
    })
}

async function obtenerCoordsEPSG() {
    let coords = await eel.obtenerCoordsEPSG()();
    coords = JSON.parse(coords);
    elMapa.setView([coords.long, coords.lat], 10);
}

async function obtenerGeoJson(lng, lat, tag) {
    // Elimina las capas
    elMapa.eachLayer((layer) => {
        if (layer.myTag && layer.myTag == "isocrona") {
            elMapa.removeLayer(layer);
        }
    });


    let geojson = await eel.obtenerGeoJson(lng, lat, tiempoDeIsocrona)();
    return L.geoJSON(geojson, {
        onEachFeature: function (feature, layer) {
            layer.myTag = tag
        }
    });

    //let nuevasCoords = new L.LatLng(lng, lat);
    //marcadorIsocrona.setLatLng(nuevasCoords);
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
                marker.addTo(pointersSVA).on('click', onClickMarcador(place.Lat, place.Lng));;
                break;
            case "SVB":
                marker = L.marker([place.Lat, place.Lng], {
                    icon: marcadorSVB
                }).bindPopup(contenidoMarcador);
                marker.addTo(pointersSVB).on('click', onClickMarcador(place.Lat, place.Lng));;
                break;

            case "Base":
                marker = L.marker([place.Lat, place.Lng], {
                    icon: marcadorBase
                }).bindPopup(contenidoMarcador);
                marker.addTo(pointersBases).on('click', onClickMarcador(place.Lat, place.Lng));
                break;
        }

        marcadores.push(marker);

    });
}

function toggleIsocronas() {
    todasLasIsocronasVisibles = !todasLasIsocronasVisibles;

    if (todasLasIsocronasVisibles) {
        isocronas.forEach((isocrona) => {
            console.log(isocrona)
            if (!elMapa.hasLayer(isocrona)) {
                isocrona.addTo(elMapa);
            }
        })
    } else {
        elMapa.eachLayer((layer) => {
            if (layer.tag == "isocrona") {
                elMapa.removeLayer(layer);
            }
        })
    }
}


obtenerCoordsEPSG();
//obtenerGeoJson(coordsUniversitat.lng, coordsUniversitat.lat);

// Bloquejat per problemes en CORS
//obtenerGeoJson();
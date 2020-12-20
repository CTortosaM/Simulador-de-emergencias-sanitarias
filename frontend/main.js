const coordsUniversitat = {
    lng: 38.955,
    lat: -0.1655,
    zoom: 15
}

// LEAFLET
const elMapa = L.map('mapa');

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(elMapa);

elMapa.on('click', (event => {
    let coord = event.latlng;
    obtenerGeoJson(coord.lat, coord.lng)
}));

//var sideBar = L.control.sidebar('sidebar').addTo(elMapa);
let pointers = [];

getVehiculos("SVA");
// ---------------

async function obtenerCoordsEPSG() {
    let coords = await eel.obtenerCoordsEPSG()();
    coords = JSON.parse(coords);
    console.log(coords);
    elMapa.setView([coords.long, coords.lat], 15);
}

async function obtenerGeoJson(lng, lat) {

    // Elimina las capas
     elMapa.eachLayer((layer) => {
        if (layer.myTag && layer.myTag == "asincrona") {
            elMapa.removeLayer(layer);
        }
    });

    let geojson = await eel.obtenerGeoJson(lng, lat)();

    L.geoJSON(geojson, {
        onEachFeature: function(feature, layer) {
            layer.myTag = "asincrona"
        }
    }).addTo(elMapa)
}

async function getVehiculos (tipo) {
    let datosVehiculos = await eel.getVehiculos(tipo)();
    console.log(datosVehiculos);
}


obtenerCoordsEPSG();
//obtenerGeoJson(coordsUniversitat.lng, coordsUniversitat.lat);

// Bloquejat per problemes en CORS
//obtenerGeoJson();
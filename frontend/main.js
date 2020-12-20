const coordsUniversitat = {
    lng: 38.955,
    lat: -0.1655,
    zoom: 3
}

// LEAFLET
//var sideBar = L.control.sidebar('sidebar').addTo(elMapa);
let pointersSVA = L.layerGroup();
let pointersSVB = L.layerGroup();

let baseLayers = {
    "Base":L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    })
}

getVehiculos("SVA");
let overlays = {
    "SVA": pointersSVA,
    "SVB": pointersSVB
}
const elMapa = L.map('mapa', {
    zoomControl: false,
    minZoom: 7,
    layers: [baseLayers["Base"], pointersSVA, pointersSVB]
});

L.control.zoom({
    position: 'topright'
}).addTo(elMapa);

elMapa.on('click', (event => {
    let coord = event.latlng;
    obtenerGeoJson(coord.lat, coord.lng)
}));
L.control.layers(baseLayers, overlays).addTo(elMapa);
// ---------------

async function obtenerCoordsEPSG() {
    let coords = await eel.obtenerCoordsEPSG()();
    coords = JSON.parse(coords);
    console.log(coords);
    elMapa.setView([coords.long, coords.lat], 10);
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
        onEachFeature: function (feature, layer) {
            layer.myTag = "asincrona"
        }
    }).addTo(elMapa)
}

async function getVehiculos(tipo) {
    let datosVehiculos = await eel.getVehiculos(tipo)();

    if (!datosVehiculos) return;

    let lista = JSON.parse(datosVehiculos);

    lista.forEach(place => {
        console.log("HOLA")
        let contenidoMarcador = `
             <b>
                 ${place.Descripcion}
             </b>
             <p>
                 Disponibilidad: ${place.Disponibilidad}
             </p>
         `
        let marker = L.marker([place.Lat, place.Lng]).bindPopup(contenidoMarcador);

        switch (tipo) {
            case "SVA":
                marker.addTo(pointersSVA);
                break;
            case "SVB":
                marker.addTo(pointersSVB);
                break;
        }
    });
}


obtenerCoordsEPSG();
//obtenerGeoJson(coordsUniversitat.lng, coordsUniversitat.lat);

// Bloquejat per problemes en CORS
//obtenerGeoJson();
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

const onClick = () => {};
const onDrag = () => {};

var carrito = new IsochroneEntity(39, -0.6, 'SVB', 10, elMapa, onClick, onDrag);
let hospital = new MapEntity(39.06, -0.57, 'Base', 'medkit', 'pink', elMapa, onClick, onDrag);


eel.obtenerGeoJson(carrito.lng, carrito.lat, carrito.tiempoDeIsocrona)().then((json) => {
    L.geoJSON(json).addTo(elMapa);
});

carrito.setDraggableMarker(true);
hospital.setDraggableMarker(true);
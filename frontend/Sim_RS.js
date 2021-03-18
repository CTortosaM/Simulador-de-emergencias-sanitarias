/*
    Carlos Tortosa Micó
    Trabajo final de Grado
    Grado en Tecnologías Interactivas

    18/03/2021
*/

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

var carrito = new IsochroneEntity(39, -0.6, 'SVA', 10, elMapa, onClick, onDrag);
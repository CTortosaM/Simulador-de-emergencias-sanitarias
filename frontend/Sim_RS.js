import MapEntity from './Clases/MapEntity.js'
import IsochroneEntity from './Clases/IsochroneEntity.js'

let pablito = new MapEntity(34,21, 'Ambulancia', 'ambulance', 'red', elMapa, (e) => {
    pablito.hiderMarker();
}, (e)=>{
    console.log(e.latlng);
});

let carrito = new IsochroneEntity(0,0,'SVA',10,elMapa,(e) => {}, (e) => {});
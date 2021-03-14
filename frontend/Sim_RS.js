import MapEntity from './Clases/MapEntity.js'

let pablito = new MapEntity(34,21, 'Ambulancia', 'ambulance', 'red', elMapa, (e) => {
    pablito.hiderMarker();
}, (e)=>{
    console.log(e.latlng);
});
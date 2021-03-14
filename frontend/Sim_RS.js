import MapEntity from './Clases/MapEntity.js'

let pablito = new MapEntity(34,21, 'Ambulancia', 'ambulance', 'red', elMapa);

console.log(pablito.getCoord('lat'));

pablito.setCoord('lat', 69);

console.log(pablito.getCoord('lat'));
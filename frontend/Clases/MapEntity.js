export default class MapEntity{

    /**
     * 
     * @param {number} lat 
     * @param {number} lng 
     * @param {object} icono // FontAwsomeIcon
     * @param {object} isocrona // GeoJson
     * @param {string} tipo 
     */
    constructor(lat = 0, lng = 0, icono = undefined, isocrona = null, tipo = 'SVA') {
        this.lat = lat;
        this.lat = lng;
        this.isocrona = isocrona;
        this.tipo = tipo;
        this.icono = icono;
    }

    /**
     * Cambia la coordenada indicada al nuevo valor proporcionado
     * @param {string} coord 
     * @param {number} value 
     */
    setCoord(coord = 'lat', value) {
        if (this[coord]) this[coord] = value;
    }


    /**
     * Devuelve el valor de la coordenada cuyo nombre es el proporcionado
     * @param {string} coordname 
     * @returns {number} coord value
     */
    getCoord(coordname = 'lat') {
        if (this[coordname]) return this[coordname];
        return null;
    }


    /**
     * Cambia las coordenadas a las indicadas por el objeto parámetro
     * con campo lat y lng
     * @param {object} position 
     */
    moveTo(position = {lat: 0, lng: 0}) {
        if (position.lat && position.lng) {
            this.lat = position.lat;
            this.lng = position.lng;
        }
    }

}
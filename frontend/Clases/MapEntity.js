module.exports.MapEntity = class {

    constructor(lat, lng, icono, isocrona, tipo) {}

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
     * @returns {number}
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
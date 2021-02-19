module.exports.MarcadorObjeto = class {

    constructor(lat, lng, icono, isocrona, tipo) {
    }

    setCoord(coord = 'lat', value) {
        if(this[coord]) this[coord] = value;
    }

    getCoord(coord = 'lat') {
        if (this[coord]) return this[coord];
    }

    moveTo(position = {lat:0, lng:0}) {
        this.lat = position.lat;
        this.lng = position.lng;
    }

}
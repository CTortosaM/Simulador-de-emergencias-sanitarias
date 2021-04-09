/**
 * Representa una entidad Base del mapa, con capacidad para 
 * albergar vehiculos
 */
class Base {

    /**
     * 
     * @param {number} lat 
     * @param {number} lng 
     */
    constructor(lat = 0, lng = 0) {
        this.posicion = {lat: lat, lng: lng};

        let icono = L.AwesomeMarkers.icon({
            icon: 'medkit',
            markerColor: 'pink',
            prefix: 'fa'
        });

        this.marcador = L.marker(this.posicion, {
            icon: icono,
            draggable: true
        }).addTo(elMapa);
    }


    /**
     * Añade vehiculo a la pila correspondiente
     * @param {Vehiculo} unVehiculo
     */
    anyadirVehiculo(unVehiculo) {
        console.log(typeof vehiculo);
    }


    /**
     * Guarda el vehiculo en esta base
     * @param {Vehiculo} vehiculo Vehiculo a anyadir 
     */
    extaerVehiculo(vehiculo) {
        console.log(typeof vehiculo);
    }

}
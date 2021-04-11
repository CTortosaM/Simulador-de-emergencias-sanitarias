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
    constructor(lat = 0, lng = 0, descripcion = 'Una descripción', elMapa) {
        this.posicion = {lat: lat, lng: lng};
        this.descripcion = descripcion;

        this.elMapa = elMapa;

        this.vehiculosSVA = [];
        this.vehiculosSVB = [];

        let icono = L.AwesomeMarkers.icon({
            icon: 'medkit',
            markerColor: 'pink',
            prefix: 'fa'
        });

        let markerContent = `
            <b>${this.descripcion}</b>
        `;

        this.marcador = L.marker(this.posicion, {
            icon: icono,
            draggable: false
        });

        this.marcador.bindPopup(markerContent);
        this.marcador.addTo(this.elMapa);
    }


    /**
     * Añade vehiculo a la pila correspondiente
     * @param {Vehiculo} unVehiculo
     */
    anyadirVehiculo(unVehiculo) {
        if (unVehiculo instanceof Vehiculo) {
            console.log(unVehiculo.tipoDeVehiculo)
        }
    }


    /**
     * Extrae el un vehiculo elegido
     * @param {Vehiculo} vehiculo Vehiculo a anyadir 
     */
    extaerVehiculo(vehiculo) {
        if (3) {

        }
    }

}
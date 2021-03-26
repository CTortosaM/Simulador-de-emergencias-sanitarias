class Vehiculo {

    /**
     * 
     * @param {number} lat Latitud de la posición geográfica
     * @param {number} lng Longitud de la posición geográfica
     * @param {string} tipoDeVehiculo Por defecto 'SAMU'
     * @param {number} tiempoDeIsocrona Alcance de la isocrona del vehiculo
     * @param {object} elMapa Referencia al mapa de Leaflet
     */
    constructor(lat = 0, lng = 0, tipoDeVehiculo = 'SAMU', tiempoDeIsocrona = 10, elMapa = null) {
        this.posicion = {};
        this.posicion.lat = lat;
        this.posicion.lng = lng;

        this.tipoDeVehiculo = tipoDeVehiculo;
        this.tiempoDeIsocrona = tiempoDeIsocrona;
        this.elMapa = elMapa;
        this.isocrona = null;
        // ------------------------------------------
        /*
            Setup del marcador
            La idea es que dependiendo de si es un SVB o un SAMU
            el marcador sea rojo o azul respectivamente
            También cambia el color de la isocrona
        */
        // ------------------------------------------

        let colorMarcador;

        switch (tipo) {
            case 'SVB':
                colorMarcador = 'blue';
                this.colorIsocrona = '#129fe6'; // Color azul en hex
                break;

            case 'SAMU':
                colorMarcador = 'red';
                this.colorIsocrona = '#e61212' // Color rojo en hex
                break;

            default:
                colorMarcador = 'red';
                this.colorIsocrona = '#e61212'
                break;
        }

        let icono = L.AwesomeMarkers.icon({
            icon: 'ambulance',
            markerColor: colorMarcador,
            prefix: 'fa'
        });

        this.marcador = L.marker(this.posicion, {
            icon: icono,
            draggable: true
        }).addTo(this.elMapa);
    }


    /**
     * Desplaza el vehiculo a la posición indicada 
     * por las coordenadas proporcionadas
     * @param {number} lat 
     * @param {number} lng 
     */
    desplazarA(lat = 0, lng = 0) {
        this.posicion.lat = lat;
        this.posicion.lng = lng;

        this.marcador.setLatLng(this.posicion).update();
    }


    /**
     * Actualiza el alcance de la isocrona 
     * @param {number} nuevoTiempo Nuevo tiempo para la isocrona
     * @param {function} onAcabado Callback ejecutado al acabar la operación
     */
    actualizarIsocrona(nuevoTiempo = 10, onAcabado = () => {}) {
    }


    /**
     * Establece la visibilidad de la isocrona en el Mapa
     * @param {boolean} visibilidad 
     */
    setVisibilidadIsocrona(visibilidad = false) {
        if (!this.isocrona) return;

        if (this.esLaIsocronaVisible()) {
            this.elMapa.removeLayer(this.isocrona);
            return;
        }

        this.isocrona.addTo(this.elMapa);
    }

    /**
     * 
     * @returns {boolean} Visibilidad de la isocrona en el mapa
     */
    esLaIsocronaVisible() {
        return this.elMapa.hasLayer(this.isocrona);
    }

}
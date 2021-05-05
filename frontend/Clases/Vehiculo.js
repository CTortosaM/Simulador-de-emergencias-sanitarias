/**
 * Representa una entidad vehiculo en el Mapa
 */

class Vehiculo {

    /**
     * 
     * @param {number} lat Latitud de la posición geográfica
     * @param {number} lng Longitud de la posición geográfica
     * @param {string} tipoDeVehiculo Por defecto 'SAMU'
     * @param {string} horario Horario del día que está disponible el vehiculo
     * @param {number} tiempoDeIsocrona Alcance de la isocrona del vehiculo
     * @param {object} elMapa Referencia al mapa de Leaflet
     */
    constructor(lat = 0, lng = 0, tipoDeVehiculo = 'SVA', disponibilidad = '12 AM', tiempoDeIsocrona = 10, elMapa = null, descripcion = '') {
        this.posicion = {};
        this.posicion.lat = lat;
        this.posicion.lng = lng;

        this.disponibilidad = disponibilidad;
        this.descripcion = descripcion;

        this.tipoDeVehiculo = tipoDeVehiculo;
        this.tiempoDeIsocrona = tiempoDeIsocrona;
        this.elMapa = elMapa;
        this.isocrona = null;

        this.enlaceABackend = new EnlaceABackend();
        // ------------------------------------------
        /*
            Setup del marcador
            La idea es que dependiendo de si es un SVB o un SAMU
            el marcador sea rojo o azul respectivamente
            También cambia el color de la isocrona
        */
        // ------------------------------------------

        let colorMarcador;

        switch (tipoDeVehiculo) {
            case 'SVB':
                colorMarcador = 'blue';
                this.colorIsocrona = '#129fe6'; // Color azul en hex
                break;

            case 'SVA':
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

        this.marcador.on('click', (e) => {
            this.setVisibilidadIsocrona(!this.marcador.isPopupOpen());

            if (selectionMode) {
                this.setVisibilidadIsocrona(false);
                anyadirVehiculo(this);
                setSelectionMode(false);
            }
        })
        
        this.marcador.bindPopup(`
            <b>${descripcion}<b>
            <p>Disponibilidad: ${disponibilidad}</p>
        `);
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
    actualizarIsocrona(nuevoTiempo = 10, onAcabado = (success, failure) => {}) {
        this.setVisibilidadIsocrona(false);
        
        if (elMapa.hasLayer(this.isocrona)) elMapa.removeLayer(this.isocrona);
        this.tiempoDeIsocrona = nuevoTiempo;

        this.enlaceABackend.getIsocrona(
            this.posicion.lat,
            this.posicion.lng,
            this.tiempoDeIsocrona,
            (res, error) => {
                if (error) {
                    this.isocrona = null;
                    this.setVisibilidadIsocrona(false);
                    // Success - Failure
                    onAcabado(null, error);
                    return;
                }

                if (res.error) {
                    this.isocrona = null;

                    onAcabado(null, res.error);
                    return;
                }

                this.isocrona = L.geoJSON(res, {
                    style: {
                        color: this.colorIsocrona
                    }
                });

                onAcabado('Success', null);
            }
        )
    }


    /**
     * Establece la visibilidad de la isocrona en el Mapa
     * @param {boolean} visibilidad 
     */
    setVisibilidadIsocrona(visibilidad = false) {
        if (!this.isocrona) return;

        if (!visibilidad) {
            if (this.isocrona) {
                this.elMapa.removeLayer(this.isocrona);
            }
            return;
        }

        if (this.isocrona) {
            this.isocrona.addTo(this.elMapa);
        }
    }

    /**
     * 
     * @returns {boolean} Visibilidad de la isocrona en el mapa
     */
    esLaIsocronaVisible() {
        return this.elMapa.hasLayer(this.isocrona);
    }


    /**
     * Comprueba si existe solape entre isocronas y devuelve
     * un objeto Overlap / null
     * @param {Vehiculo} otroVehiculo 
     * @returns interseccion
     */
    checkSolapeCon(otroVehiculo) {

        // Esta es la mejor manera que encontré de 
        // revertir al objeto original isocrona
        // de antes del procesado que hace leaflet
        let property1 = Object.keys(this.isocrona._layers)[0];
        let candidate1 = this.isocrona._layers[property1].feature;

        let property2 = Object.keys(otroVehiculo.isocrona._layers)[0];
        let candidate2 = otroVehiculo.isocrona._layers[property2].feature;

        let interseccion = turf.intersect(candidate1, candidate2);

        return interseccion;
    }

    /**
     * 
     * @param {object} e 
     */
     onDragMarcador(e, callback) {
        let newCoords = e.target._latlng;
        this.desplazarA(newCoords.lat, newCoords.lng);

        this.setVisibilidadIsocrona(false);
        this.actualizarIsocrona(this.tiempoDeIsocrona, (worked, error) => {
            if (worked && !error) {
                this.setVisibilidadIsocrona(true);
                callback(this.isocrona);
            } else {
                callback(null);
            }
        });
    }

}
/**
 * Representa una entidad Base del mapa, con capacidad para 
 * albergar vehiculos
 */
class Base {

    /**
     * 
     * @param {number} lat Latitud de la posición
     * @param {number} lng Longitud de la posición
     * @param {string} descripcion Descripción de la base
     * @param {object} elMapa Referencia al mapa de Leaflet
     * @param {function} onClickExtraer Acción al clickar botón de extraer
     */
    constructor(lat = 0, lng = 0, descripcion = 'Una descripción', elMapa, onClickExtraer) {
        this.posicion = {
            lat: lat,
            lng: lng
        };
        this.descripcion = descripcion;

        this.elMapa = elMapa;

        this.vehiculosSVA = [];
        this.vehiculosSVB = [];

        this.vehiculos = [];

        let icono = L.AwesomeMarkers.icon({
            icon: 'medkit',
            markerColor: 'pink',
            prefix: 'fa'
        });

        let markerContent = `
            <b>${this.descripcion}</b>
            <br>
            <button class="btn btn-dark">Extraer Vehiculo</button>
            <p>${this.vehiculos.length} coches disponibles</p>
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
        console.log('el primer log')
        if (unVehiculo instanceof Vehiculo) {
            if (!this.vehiculos.includes(unVehiculo)) {
                this.vehiculos.push(unVehiculo);

                if (unVehiculo.tipoDeVehiculo === 'SVA') {
                    this.vehiculosSVA.push(unVehiculo);
                    this._updatePopup();
                    return;
                }

                this.vehiculosSVB.push(unVehiculo);
                this._updatePopup();
                console.log('si o no')
                
            } else {
                console.log('aparentmente está ya en el array')
            }
        } else {
            console.log('Aparentmente no es un coche')
        }
    }


    /**
     * Extrae el último vehiculo añadido a la base 
     */
    extaerVehiculo() {

        if (this.vehiculos.length === 0) return null;

        let elVehiculo = this.vehiculos.pop();

        if (this.vehiculosSVA.includes(elVehiculo)) {
            this.vehiculosSVA.splice(this.vehiculosSVA.indexOf(elVehiculo), 1);
        }

        if (this.vehiculosSVB.includes(elVehiculo)) {
            this.vehiculosSVB.splice(this.vehiculosSVB.indexOf(elVehiculo), 1);
        }

        this._updatePopup();
        return elVehiculo;
    }


    _updatePopup() {
        console.log('creo que me muero')
        this.marcador.setPopupContent(`
        <b>${this.descripcion}</b>
        <br>
        <button class="btn btn-dark">Extraer Vehiculo</button>
        <p>${this.vehiculos.length} coches disponibles</p>
        `);
    }

}
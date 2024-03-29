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
     */
    constructor(lat = 0, lng = 0, descripcion = 'Una descripción', elMapa) {
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
            icon: 'plus-square',
            markerColor: 'pink',
            prefix: 'fa'
        });

        let markerContent = `
        
        <b>${this.descripcion}</b>
        <br>
        <div class="seccionBotonesPopupBase">
        <button class="btn btn-dark botonPopupBase" onClick="extraerVehiculo()">Extraer Vehiculo</button>
        <button class="btn btn-dark botonPopupBase" onClick="setSelectionMode(true)">Mover Vehiculo</button>
        </div>
        <p>Tras pulsar "Mover Vehiculo", selecciona en el mapa un marcador de vehículo</p>
        <p>${this.vehiculos.length} vehiculos disponibles</p>
        `;

        this.marcador = L.marker(this.posicion, {
            icon: icono,
            draggable: false
        });

        this.marcador.bindPopup(markerContent);
        this.marcador.addTo(this.elMapa);

        this.marcador.on('click', (e) => {
            lastBaseClicked = this;
            setSelectionMode(false);
        })
    }


    /**
     * Añade vehiculo a la pila correspondiente
     * @param {Vehiculo} unVehiculo 
     */
    anyadirVehiculo(unVehiculo) {
        if (unVehiculo instanceof Vehiculo) {
            if (!this.vehiculos.includes(unVehiculo)) {
                this.vehiculos.push(unVehiculo);

                if (unVehiculo.tipoDeVehiculo === 'SVA') {
                    this.vehiculosSVA.push(unVehiculo);
                } else if (unVehiculo.tipoDeVehiculo === 'SVB') {
                    this.vehiculosSVB.push(unVehiculo);
                }

                unVehiculo.setVisibilidadIsocrona(false);
                unVehiculo.isocrona = null;
                elMapa.removeLayer(unVehiculo.marcador);

                this._updatePopup();
            }
        }
    }


    /**
     * Extrae el último vehículo y lo coloca en el mapa
     */
    extraerVehiculo() {

        if (this.vehiculos.length === 0) return;

        let elVehiculo = this.vehiculos.pop();

        if (this.vehiculosSVA.includes(elVehiculo)) {
            this.vehiculosSVA.splice(this.vehiculosSVA.indexOf(elVehiculo), 1);
        }

        if (this.vehiculosSVB.includes(elVehiculo)) {
            this.vehiculosSVB.splice(this.vehiculosSVB.indexOf(elVehiculo), 1);
        }

        this._updatePopup();

        // Lo coloco al lado del centro
        elVehiculo.desplazarA(this.posicion.lat, this.posicion.lng + 0.12);
        elVehiculo.marcador.addTo(elMapa);
    }

    /**
     * Actualiza el contenido del popup
     */
    _updatePopup() {
        this.marcador.setPopupContent(`
        <b>${this.descripcion}</b>
        <br>
        <div class="seccionBotonesPopupBase">
        <button class="btn btn-dark botonPopupBase" onClick="extraerVehiculo()">Extraer Vehiculo</button>
        <button class="btn btn-dark botonPopupBase" onClick="setSelectionMode(true)">Mover Vehiculo</button>
        </div>
        <p>Tras pulsar "Mover Vehiculo", selecciona en el mapa un marcador de vehículo</p>
        <p>${this.vehiculos.length} vehiculos disponibles</p>
    `);
    }

}
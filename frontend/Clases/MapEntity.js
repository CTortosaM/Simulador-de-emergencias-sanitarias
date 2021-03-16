export default class MapEntity {

    /**
     * 
     * @param {number} lat Latitud en el mapa
     * @param {number} lng Longitud en el mapa
     * @param {string} tipo Tipo de entidad colocada en el mapa
     * @param {string} nombreIcono Nombre estandarizado de FontAwsome
     * @param {string} colorMarcador Color del marcador
     * @param {object} elMapa Referencia al mapa donde se coloca el marcador
     * @param {object} onClick Callback para el evento onClickDelMarcador
     */
    constructor(lat = 0, lng = 0, tipo = 'SVA', nombreIcono = 'ambulance', colorMarcador = 'red', elMapa, onClick, onDrag) {
        this.lat = lat;
        this.lng = lng;
        this.tipo = tipo;

        // Propiedades del marcador
        this.marcadorVisible = true;
        this.marcadorDraggable = false;

        // Referencia al mapa
        this.elMapa = elMapa;

        this.marcador = this.setupMarcador(nombreIcono, colorMarcador);

        // Define método onCLick del marcador definido por el usuario
        this.marcador.on('click', (e) => {
            onClick(e);
        });

        // Define el comportamiento en el evento de onDrag
        this.marcador.on('dragend', (e) => {
            if (this.marcadorDraggable) onDrag(e);
        });

        // Finalmente, añade el marcador al mapa
        this.marcador.addTo(elMapa);
    }

    /**
     * Genera un objeto marcador de Leaflet con la información de
     * icono proporcionada
     * @param {string} tipo 
     * @returns LeafletMarker
     */
    setupMarcador(iconName = 'ambulance', markerColor = 'red') {
        let iconStyle = L.AwesomeMarkers.icon({
            icon: iconName,
            markerColor: markerColor,
            prefix: 'fa'
        })

        return L.marker([this.lat, this.lng], {
            icon: iconStyle,
            draggable: false
        });
    }

    /**
     * Cambia la coordenada indicada al nuevo valor proporcionado
     * @param {string} coord 
     * @param {number} value 
     */
    setCoord(coord = 'lat', value) {
        if (coord === 'lat') this.lat = value;
        if (coord === 'lng') this.lng = value;

        this.marcador.setLatLng([this.lat, this.lng]).update();
    }


    /**
     * Devuelve el valor de la coordenada cuyo nombre es el proporcionado
     * @param {string} coordname 
     * @returns {number} coord value
     */
    getCoord(coordname = 'lat') {
        if (coordname === 'lat') return this.lat;
        if (coordname === 'lng') return this.lng;
        return null;
    }


    /**
     * Mueve el MapEntity a las coordenadas especificadas
     * @param {number} lat 
     * @param {number} lng 
     */
    moveTo(lat = 0, lng = 0) {
        this.lat = lat;
        this.lng = lng;
        this.marcador.setLatLng([lat, lng]).update();
    }

    /**
     * Oculta el marcador en el mapa
     */
    hideMarker() {
        if (this.marcadorVisible) {
            this.elMapa.removeLayer(this.marcador);
            this.marcadorVisible = false;
        }
    }

    /**
     * Coloca el marcador en el mapa en el caso de que
     * estuviese oculto
     */
    showMarker() {
        if (!this.marcadorVisible) {
            this.marcador.addTo(elMapa);
            this.marcadorVisible = true;
        }
    }


    /**
     * Determina si el marcador puede o no arrastrarse por el mapa
     * @param {boolean} canBeDragged 
     */
    setDraggableMarker(canBeDragged = false) {
        this.marcadorDraggable = canBeDragged;

        if (canBeDragged) {
            this.marcador.options.draggable = true;
        } else {
            this.marcador.options.draggable = false;
        }
    }



}
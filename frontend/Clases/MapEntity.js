export default class MapEntity{

    /**
     * 
     * @param {number} lat Latitud en el mapa
     * @param {number} lng Longitud en el mapa
     * @param {string} tipo Tipo de entidad colocada en el mapa
     * @param {string} nombreIcono Nombre estandarizado de FontAwsome
     * @param {string} colorMarcador Color del marcador
     * @param {object} elMapa Referencia al mapa donde se coloca el marcador
     */
    constructor(lat = 0, lng = 0, tipo = 'SVA', nombreIcono = 'ambulance', colorMarcador = 'red', elMapa) {
        this.lat = lat;
        this.lng = lng;
        this.tipo = tipo;
        this.marcadorVisible = true;
        this.elMapa = elMapa;

        this.marcador = this.setupMarcador(nombreIcono, colorMarcador);

        this.marcador.on('click', (e) => {
            this.moveTo(0, 0);
        });

        this.marcador.addTo(elMapa);
    }

    // ------------------------------------------------------------------
    // PRIVATE
    // ------------------------------------------------------------------
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

        return L.marker([this.lat, this.lng], {icon: iconStyle});
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
    
    
    setMarkerVisibility(visible = true) {

        if (visible && !elMapa.hasLayer(this.marcador)) {
            this.marcador.addTo(elMapa);
            this.marcadorVisible = true;
            return;
        } 


    }

}
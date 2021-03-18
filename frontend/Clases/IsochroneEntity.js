class IsochroneEntity extends MapEntity {

    /**
     * 
     * @param {number} lat Latitud de la posición
     * @param {number} lng Longitud de la posición
     * @param {string} tipo Tipo de objeto con isócrona
     * @param {number} tiempo Tiempo de alcance de la isócrona
     * @param {object} elMapa Referencia al mapa de Leaflet
     * @param {function} onClick Comportamiento al clickar
     * @param {function} onDrag Comportamiento al arrastrar
     */
    constructor(lat = 0, lng = 0, tipo = 'SVA', tiempo = 10, elMapa, onClick, onDrag) {

        let isocronaColor = '#ffffff';
        let markerColor = 'red';
        let iconName = '';

        switch (tipo) {
            case 'SVA':
                iconName = 'ambulance';
                isocronaColor = '#e61212';
                markerColor = 'red';
                break;
            case 'SVB':
                iconName = 'ambulance';
                isocronaColor = '#129fe6';
                markerColor = 'blue'
                break;
            case 'Interseccion':
                iconName = 'layer-group';
                isocronaColor = '#000000'
                markerColor = 'green'
                break
            default:
                iconName = 'ambulance';
                isocronaColor = '#e61212';
                markerColor = 'red'
                break;
        }

        super(lat, lng, tipo, iconName, markerColor, elMapa, onClick, onDrag);

        this.tiempoDeIsocrona = tiempo;
        this.isocronaVisible = false;
        this.isocrona = null;
        this.colorDeIsocrona = isocronaColor;
    }

    /**
     * Oculta la isocrona en el mapa
     */
    hideIsocrona() {
        if (this.isocrona) {
            

            if (this.elMapa.hasLayer(this.isocrona)){
                this.isocronaVisible = false;
                this.elMapa.removeLayer(this.isocrona);
            }

        }
    }

    /**
     * Coloca la isocrona en el mapa
     */
    showIsocrona() {
        if (this.isocrona) {
            this.isocronaVisible = true;
            this.isocrona.addTo(this.elMapa);
            return
        }
    }

    /**
     * Almacena el objeto isocrona
     * @param {objet} isocrona Objeto GeoJson
     */
    setIsocrona(isocrona) {
        this.isocrona = isocrona;
    }

}
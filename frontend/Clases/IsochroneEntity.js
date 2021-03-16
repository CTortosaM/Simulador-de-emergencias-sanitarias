import MapEntity from './MapEntity.js'

export default class IsochroneEntity extends MapEntity {

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
    constructor(lat = 0, lng = 0, tipo = '', tiempo = 10, elMapa, onClick, onDrag) {

        let isocronaColor = '#ffffff';
        let iconName = '';

        switch (tipo) {
            case 'SVA':
                iconName = 'ambulance';
                break;
            default :
                iconName = 'ambulance';
                break;
        }

        super(lat, lng, tipo, 'ambulance', 'red', elMapa, onClick, onDrag);

        this.tiempoDeIsocrona = tiempo;
        this.isocronaVisible = false;
        this.isocrona = null;

        this.updateIsocrona(10);
    }

    /**
     * Recalcula la isocrona de la entidad segun el tiempo dado
     * @param {number} tiempoDeIsocrona
     */
    updateIsocrona(tiempo) {
        this.tiempoDeIsocrona = tiempo;

        eel.obtenerGeoJson(this.lng, this.lat, this.tiempoDeIsocrona)().then((json) => {
            if (json.type === 'FeatureCollection') {
                this.isocrona = json;
            }
        }, (fallo) => {
            console.error(fallo);
        });
    }

    /**
     * Oculta la isocrona en el mapa
     */
    hideIsocrona() {
        if (this.isocronaVisible && this.isocrona) {
            this.isocronaVisible = false;

            if (this.elMapa.hasLayer(this.isocrona)) this.elMapa.removeLayer(this.isocrona);
        }
    }

    /**
     * Coloca la isocrona en el mapa
     */
    showIsocrona() {
        if (!this.isocronaVisible && this.isocrona) {
            this.isocronaVisible = true;

            if (!this.elMapa.hasLayer(this.isocrona)) L.geoJson(this.isocrona).addTo(elMapa);
        }
    }

}
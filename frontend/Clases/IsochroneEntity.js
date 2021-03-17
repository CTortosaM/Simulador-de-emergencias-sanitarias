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
    constructor(lat = 0, lng = 0, tipo = 'SVA', tiempo = 10, elMapa, onClick, onDrag) {

        let isocronaColor = '#ffffff';
        let markerColor = 'red';
        let iconName = '';

        switch (tipo) {
            case 'SVA':
                iconName = 'ambulance';
                isocronaColor = '#e61212';
                markerColor = 'blue';
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
                this.isocrona = L.geoJson(json, {
                    style: {
                        color: this.colorDeIsocrona
                    }
                });
            } else {
                this.isocrona = null;
            }
        }, (fallo) => {
            console.error(fallo);
            this.isocrona = null;
        });
    }

    /**
     * Oculta la isocrona en el mapa
     */
    hideIsocrona() {
        if (this.isocronaVisible && this.isocrona) {
            this.isocronaVisible = false;

            if (this.elMapa.hasLayer(this.isocrona)) this.elMapa.removeLayer(this.isocrona);
        } else if (this.isocrona === null) {
            this.updateIsocrona(this.tiempoDeIsocrona);
        }
    }

    /**
     * Coloca la isocrona en el mapa
     */
    showIsocrona() {
        if (!this.isocronaVisible && this.isocrona) {
            this.isocronaVisible = true;

            if (!this.elMapa.hasLayer(this.isocrona)) L.geoJson(this.isocrona).addTo(elMapa);
        } else if (this.isocrona === null) {
            this.updateIsocrona(this.tiempoDeIsocrona);
        }
    }

}
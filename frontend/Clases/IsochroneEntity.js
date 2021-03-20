class IsochroneEntity extends MapEntity {

    /**
     * 
     * @param {number} lat Latitud de la posición
     * @param {number} lng Longitud de la posición
     * @param {string} tipo Tipo de objeto con isócrona
     * @param {number} tiempo Tiempo de alcance de la isócrona
     * @param {object} elMapa Referencia al mapa de Leaflet
     */
    constructor(lat = 0, lng = 0, tipo = 'SVA', tiempo = 10, elMapa) {

        let isocronaColor = '#e61212';
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

        super(lat, lng, tipo, iconName, markerColor, elMapa);

        this.tiempoDeIsocrona = tiempo;
        this.isocronaVisible = false;
        this.isocrona = null;
        this.colorDeIsocrona = isocronaColor;

        this.marcador.on('click', (e) => {
            if (!this.isocrona) {
                this.updateIsocrona(this.tiempoDeIsocrona, (s, error) => {
                    return;
                })
            }

            if (this.isocrona && this.isocronaVisible) {
                this.hideIsocrona();
            } else if (this.isocrona && !this.isocronaVisible) {
                this.showIsocrona();
            }
        });
    }

    /**
     * Oculta la isocrona en el mapa
     */
    hideIsocrona() {
        if (this.isocrona) {
            if (this.elMapa.hasLayer(this.isocrona)) {
                this.isocronaVisible = false;
                this.elMapa.removeLayer(this.isocrona);
            }
        }
    }

    /**
     * Coloca la isocrona en el mapa
     */
    showIsocrona() {
        if (this.isocrona && !this.elMapa.hasLayer(this.isocrona)) {
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


    /**
     * Recalcula la isocrona de la entidad con el nuevo tiempo porporcionado
     * @param {number} tiempo Nuevo tiempo de la isocrona
     * @param {function} callback Callback ejecutado tras finalizar el cálculo
     */
    updateIsocrona(tiempo, callback) {
        this.tiempoDeIsocrona = tiempo;

        eel.obtenerGeoJson(this.lat, this.lng, this.tiempoDeIsocrona)()
            .then((json) => {

                if (json.type === 'FeatureCollection') {
                    this.isocrona = L.geoJSON((json), {
                        style: {
                            color: this.colorDeIsocrona
                        }
                    })
                    callback('Success', null);
                    return;
                }

                this.isocrona = null;
                callback(null, 'Null value');
            })
    }


    /**
     * 
     * @param {object} e 
     */
    onDragMarcador(e, callback) {
        let newCoords = e.target._latlng;
        this.moveTo(newCoords.lat, newCoords.lng);

        this.hideIsocrona();
        this.updateIsocrona(this.tiempoDeIsocrona, (worked, error) => {
            if (worked && !error) {
                this.showIsocrona();
                callback(this.isocrona);
            } else {
                callback(null);
            }
        });
    }


    checkSolapeCon(otroIsochroneEntity) {
        
    }

}
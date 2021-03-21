class Overlap {

    constructor(geometry, elMapa) {
        this.elMapa = elMapa;
        this.overlapSpace = L.geoJSON(geometry, {
            style: {
                color: '#0cf533' // Color verde
            }
        });

        let coordenadasMarcador = turf.center(geometry).geometry.coordinates;

        // Por algun mótivo la librería de turf
        // saca las coordenadas al revés, aqui invierto
        // el orden para usarlos más cómodamente más adelante
        let lat = coordenadasMarcador[1];
        coordenadasMarcador[1] = coordenadasMarcador[0];
        coordenadasMarcador[0] = lat;
        // ---------------------------------------------------

        this.marcador = L.marker(coordenadasMarcador, {
            icon: L.AwesomeMarkers.icon({
                icon: 'layer-group',
                markerColor: 'green',
                prefix: 'fa'
            })
        });


    }

    /**
     * Esconde el overlap del mapa
     */
    hide() {
        if (elMapa.hasLayer(this.overlapSpace)) {
            elMapa.removeLayer(this.overlapSpace);
            elMapa.removeLayer(this.marcador);
        }
    }

    /**
     * Coloca el overlap en el mapa
     */
    show() {
        if (!elMapa.hasLayer(this.overlapSpace)) {
            this.overlapSpace.addTo(elMapa);
            this.marcador.addTo(elMapa);
        }
    }

}
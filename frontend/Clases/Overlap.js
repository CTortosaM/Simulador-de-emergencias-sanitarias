class Overlap {

    constructor(geometry, elMapa) {
        this.estimacionPoblacion = null;
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

        let contenidoMarcador = `
            <p>Cargando...</p>
        `;

        this.marcador.bindPopup(contenidoMarcador);

        this.marcador.on('click', (e) => {
            if (!this.estimacionPoblacion) {
                /*eel.getEstimacionPoblacion(geometry.geometry.coordinates[0])()
                .then((data) => {
                    this.estimacionPoblacion = data.results[0].value.estimates['gpw-v4-population-count-rev10_2020']['SUM'];
                    this.marcador.setPopupContent(`<p>${this.estimacionPoblacion}`);
                }); */

                enlaceABackend.getEstimacionPoblacion_WorldPop(geometry, (res, error) => {
                    if (res) {
                        if (typeof res === 'number') {
                            res = Math.floor(res);
                            this.estimacionPoblacion = res;
                            this.marcador.setPopupContent(`<p>${this.estimacionPoblacion}`);
                        } else {
                            console.log(res);
                        }
                    } else {
                        console.error(error);
                        this.marcador.setPopupContent(`<p>Error obteniendo datos de población`);
                    }
                })
            }
            console.log(geometry);
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
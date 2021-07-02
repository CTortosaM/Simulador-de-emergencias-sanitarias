class Overlap {

    constructor(geometry, elMapa) {
        this.estimacionPoblacion = null;
        this.elMapa = elMapa;
        this.overlapSpace = L.geoJSON(geometry, {
            style: {
                color: '#0cf533' // Color verde
            }
        });

        this.simpleGeometry = turf.simplify(geometry, {
            tolerance: 0.005,
            highQuality: true
        })

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

                enlaceABackend.getEstimacionPoblacion_WorldPop(this.simpleGeometry, (res, error) => {
                    if (error) {
                        this.marcador.setPopupContent('Error');
                        return;
                    }
                    try {
                        this.estimacionPoblacion = Math.floor(res.total_population);

                        if (this.estimacionPoblacion == isNaN) {
                            this.marcador.setPopupContent('Error obteniendo datos de población');
                        } else {
                            this.marcador.setPopupContent(`Población cubierta: ${this.estimacionPoblacion}`);
                        }
                    } catch(err) {
                        this.marcador.setPopupContent('Error obteniendo datos de población');
                    }
                })
            }
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
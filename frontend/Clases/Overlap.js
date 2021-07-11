class Overlap {

    /**
     * 
     * @param {object} geometry Objeto Geoson
     * @param {object} elMapa Referencia al mapa de leaflet
     */
    constructor(geometry, elMapa) {
        this.estimacionPoblacion = null;
        this.elMapa = elMapa;

        // Puede haver másde un polígono en la intersección
        let poligonos = [];
        this.simplePolygons = [];

        if (geometry.geometry.type === 'MultiPolygon') {
            let coordinates1 = geometry.geometry.coordinates[0];
            let coordinates2 = geometry.geometry.coordinates[1];

            let poly1 = turf.polygon(coordinates1);
            let poly2 = turf.polygon(coordinates2);

            poligonos.push(poly1);
            poligonos.push(poly2);
        } else {
            poligonos.push(geometry);
        }

        this.overlapSpace = L.geoJSON(geometry, {
            style: {
                color: '#0cf533' // Color verde
            }
        });

        poligonos.forEach((pol) => {
            this.simplePolygons.push(turf.simplify(pol, {
                tolerance: 0.005,
                highQuality: true
            }))
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

                /* enlaceABackend.getEstimacionPoblacion_WorldPop(this.simpleGeometry, (res, error) => {
                    if (error) {
                        this.marcador.setPopupContent('Error');
                        return;
                    }
                    try {
                        this.estimacionPoblacion = Math.floor(res.total_population);

                        if (isNaN(this.estimacionPoblacion)) {
                            this.marcador.setPopupContent('Error obteniendo datos de población');
                        } else {
                            this.marcador.setPopupContent(`Población cubierta: ${this.estimacionPoblacion}`);
                        }
                    } catch (err) {
                        this.marcador.setPopupContent('Error obteniendo datos de población');
                    }
                }) */

                this.getEstimacionPoblacionOverlap(0, 0);
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


    getEstimacionPoblacionOverlap(index, estimacion) {
        if (index >= this.simplePolygons.length || isNaN(estimacion)) {
            return;
        }

        this.marcador.setPopupContent(`Estimando población ${index+1}/${this.simplePolygons.length} segmentos`);
        enlaceABackend.getEstimacionPoblacion_WorldPop(this.simplePolygons[index], (res, err) => {
            if (err || isNaN(res.total_population)) {
                this.marcador.setPopupContent('Error obteniendo datos de población');
                return;
            }
            estimacion += res.total_population;

            if (index === this.simplePolygons.length - 1) {
                this.estimacionPoblacion = Math.floor(estimacion);
                this.marcador.setPopupContent(`Población cubierta: ${this.estimacionPoblacion}`);
                return;
            };
            
            this.getEstimacionPoblacionOverlap(index + 1, estimacion);
        })
    }

}
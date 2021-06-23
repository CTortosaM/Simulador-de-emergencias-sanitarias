class EnlaceABackend {
    constructor () {

    }

    /**
     * 
     * @param {Array} poligono 
     * @param {function} callback 
     */
    getEstimacionPoblacion(poligono, callback) {
        let geometriaPoligono = poligono.geometry.coordinates[0];
        eel.getEstimacionPoblacion(geometriaPoligono)().then((resultado) => {
            callback(resultado, null);
        }, (rejected) => {
            callback(null, rejected);
        });

    }


    /**
     * 
     * @param {Array} poligono Array con los vértices del polígono 
     * @param {function} callback Función callback para devolver el resultado 
     */
    getEstimacionPoblacion_WorldPop(poligono, callback) {
        eel.getEstimacionPoblacion_WorlPop(poligono)().then((resultado) => {
            callback(resultado, null);
        }, (rejected) => {
            callback(null, rejected);
        })
    }


    /**
     * Obtén un array de vehiculos de los datos
     * @param {string} tipo
     * @param {function} callback
     */
    getVehiculos(tipo, callback) {
        eel.getDatos(tipo)().then((resultado) => {
            if (resultado === 'Error') {
                callback(null, resultado);
                return;
            }

            callback(JSON.parse(resultado), null);
            return;

        }, (rejected) => {
            callback(null, rejected);
            return;
        });
    }

    /**
     * Obtén los datos de los vehículos mediante lectura de
     * fichero csv
     * @param {function} callback 
     */
    getVehiculos_CSV(callback) {
        eel.getDatos_CSV()().then((datos) => {
            if (datos === 'Error') {
                callback(null, datos);
                return;
            }

            callback(JSON.parse(datos), null);
            return;
        })
    }


    /**
     * Obtener isocrona en la localización indicada con extensión
     * del tiempo proporcionado
     * @param {number} lat 
     * @param {number} lng 
     * @param {number} tiempo 
     * @param {function} callback 
     */
    getIsocrona(lat, lng, tiempo, callback) {
        eel.obtenerGeoJson(lng, lat, tiempo)().then((resultado) => {
            if (!resultado.type === 'FeatureCollection') {
                callback(null, resultado);
                return;
            }
            callback(resultado , null);
        }, (rejected) => {
            callback(null, rejected)
        })
    }

}
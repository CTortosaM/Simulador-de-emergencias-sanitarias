class EnlaceABackend {
    constructor () {

    }

    /**
     * 
     * @param {Array} poligono 
     * @param {function} callback 
     */
    getEstimacionPoblacion(poligono, callback) {

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

}
/**
 * Clase para crear desacoplamiento entre backend y cliente
 */
class EnlaceABackend {
    constructor () {

    }

    /**
     * 
     * @param {Array} poligono Array con los vértices del polígono 
     * @param {function} callback (resultado/error)
     */
    getEstimacionPoblacion_WorldPop(poligono, callback) {
        eel.getEstimacionPoblacion_WorlPop(poligono)().then((resultado) => {
            if (!resultado.total_population) {
                callback(null, 'Error obteniendo datos');
            } else {
                callback(resultado, null);
            }
            
        }, (rejected) => {
            callback(null, rejected);
        })
    }

    /**
     * Contacta al backend para extraer la información de bases
     * @param {function} callback (Error/Res)
     */
    getBases_DB(callback) {
        eel.getDatosDeBases()().then((data) => {
            if (data.Error) {
                callback(data.Error, null);
                return;
            }

            if (!data.Data || data.Data.length === 0) {
                callback('No entries', null);
                return;
            }

            let bases = [];

            data.Data.forEach(row => {
                bases.push({
                    Lat: row[0],
                    Lng: row[1],
                    Descripcion: row[2]
                });
            });

            callback(null, bases);

        }, (rejected) => {
            callback(rejected, null);
        });
    }


    /**
     * Obtener isocrona en la localización indicada con extensión
     * del tiempo proporcionado
     * @param {number} lat Latitud de la posición
     * @param {number} lng Longitud de la posicióln
     * @param {number} tiempo Tiempo de la isócrona
     * @param {function} callback (err, res)
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
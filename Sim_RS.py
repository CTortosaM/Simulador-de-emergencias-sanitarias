# Carlos Tortosa Micó
# Trabajo final de grado
# Grado en tecnologías interactivas
# Escola Politècnica Superior de Gandía

# 14/12/2020
import eel
import json
import requests
import urllib.parse as parser
import sqlite3
# Exposa la funció al script JS
@eel.expose
def obtenerCoordsEPSG():
    coords = {
        "long": 38.955998,
        "lat": -0.165564,
    }

    # Convertir en json string
    coordenadas = json.dumps(coords)
    return coordenadas


@eel.expose
def obtenerGeoJson(lng, lat, tiempoEnMinutos):
    """Cálcula la isócrona en la posición indicada y de la extensión de tiempo proporcionada

    Parameters:
    lng (float): Longitud de la posición
    lat (float): Latitud de la posición
    tiempoEnMinutos (int): Extensión de la isocrona en minutos

    Returns:
    string:Isocrona, en forma de GeoJson y formato string
    """
    body = {"locations":[[lng, lat]],"range":[tiempoEnMinutos*60]}

    headers = {
        'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
        'Authorization': '5b3ce3597851110001cf6248d90c17ea66a34789876d047afe84449e',
        'Content-Type': 'application/json; charset=utf-8'
    }
    call = requests.post('https://api.openrouteservice.org/v2/isochrones/driving-car', json=body, headers=headers)
    return call.json()



@eel.expose
def getDatosDeBases():
    """CObtiene la información de las bases de la BD

    Parameters:

    Returns:
    {Data: Array / Null, Error: String / Null}
    """
    response = {
        'Error': None,
        'Data': []
    }

    try:
        conn = sqlite3.connect('./Datos/Datos.db')
        cur = conn.cursor()

        for row in cur.execute('SELECT Lat, Lng, Descripcion FROM Bases'):
            response['Data'].append(row)

    except (sqlite3.Error) as errorSqlite:
        response['Data'] = None
        response['Error'] = errorSqlite
    
    finally:
        if len(response['Data']) == 0:
            response['Data'] = None
            response['Error'] = 'No entries'
            
        return response


# @eel.expose
# def getEstimacionPoblacion(poligono):
#     url = 'https://sedac.ciesin.columbia.edu/arcgis/rest/services/sedac/pesv3Broker/GPServer/pesv3Broker/execute?f=json'

#     headers = {
#         'Accept-Content':'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
#         'Cookie': '_ga=GA1.2.222787148.1613236203; _gid=GA1.2.55038318.1617956848; logged=false; urs_login_status=false; uvts=28d5d143-200c-4477-4d09-314a514fbfa8',
#         'Accept-Encoding':'gzip, deflate, br'
#     }
#     requestData = {
#         "polygon": poligono,
#         "variables": [
#         "gpw-v4-population-count-rev10_2020"
#         ],
#         "statistics": [
#             "SUM"
#         ],
#         "requestID": "123456789"
#     }

#     data = {
#         "Input_Data": requestData
#     }

#     call = requests.post(url, data=parser.urlencode(data), headers=headers)
#     return call.json()


@eel.expose
def getEstimacionPoblacion_WorlPop(poligono):
    """Cálcula la población cubierta en el polígono proporcionado

    Parameters:
    poligono (dict): Poligono donde calcular la población

    Returns:
    number:Poblacion
    """

    # Proporcionamos el parámetro runasync false porque si no
    # la tarea de comprobar como de avanzada estaba la tarea mediante la API
    # se volvia demasiado compleja.
    urlParcialPoblacion = 'https://api.worldpop.org/v1/services/stats?dataset=wpgppop&year=2020&runasync=false&geojson='
    urlParcialTask = 'https://api.worldpop.org/v1/tasks/'

    query = urlParcialPoblacion + json.dumps(poligono)
    
    taskQueueRespuesta = requests.get(query)

    if taskQueueRespuesta.status_code != 200:
        return 'Not disponible'

    respuestaJson = taskQueueRespuesta.json()

    if (respuestaJson['error']):
        return respuestaJson['error']

    if (respuestaJson['status'] != 'finished' or not respuestaJson['data']):
        return 'No disponible'
    try:
        return respuestaJson['data']
    except KeyError as error:
        return 'No disponible'

eel.init("frontend")
eel.start('main.html', cmdline_args=['--start-fullscreen'], size=(1280, 720), position=(0,0))
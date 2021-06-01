# Carlos Tortosa Micó
# Trabajo final de grado
# Grado en tecnologías interactivas
# Escola Politècnica Superior de Gandía

# 14/12/2020

import eel
import json
import requests
import urllib.parse as parser

from requests.api import head, request
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
    body = {"locations":[[lng, lat]],"range":[tiempoEnMinutos*60]}

    headers = {
        'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
        'Authorization': '5b3ce3597851110001cf6248d90c17ea66a34789876d047afe84449e',
        'Content-Type': 'application/json; charset=utf-8'
    }
    call = requests.post('https://api.openrouteservice.org/v2/isochrones/driving-car', json=body, headers=headers)
    return call.json()



@eel.expose
def getDatos(tipoDeVehiculo='SVA'):

    try:
        with open('./Datos/Datos.json') as f:
            data = json.load(f)[tipoDeVehiculo]
            return json.dumps(data)
    except (KeyError, TypeError, ValueError) as error:
      return 'Error'

@eel.expose
def getEstimacionPoblacion(poligono):
    url = 'https://sedac.ciesin.columbia.edu/arcgis/rest/services/sedac/pesv3Broker/GPServer/pesv3Broker/execute?f=json'

    headers = {
        'Accept-Content':'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
        'Cookie': '_ga=GA1.2.222787148.1613236203; _gid=GA1.2.55038318.1617956848; logged=false; urs_login_status=false; uvts=28d5d143-200c-4477-4d09-314a514fbfa8',
        'Accept-Encoding':'gzip, deflate, br'
    }
    requestData = {
        "polygon": poligono,
        "variables": [
        "gpw-v4-population-count-rev10_2020"
        ],
        "statistics": [
            "SUM"
        ],
        "requestID": "123456789"
    }

    data = {
        "Input_Data": requestData
    }

    call = requests.post(url, data=parser.urlencode(data), headers=headers)
    return call.json()


@eel.expose
def getEstimacionPoblacion_WorlPop(poligono):

    # Proporcionamos el parámetro runasync false porque si no
    # la tarea de comprobar como de avanzada estaba la tarea mediante la API
    # se volvia demasiado compleja.
    urlParcialPoblacion = 'https://api.worldpop.org/v1/services/stats?dataset=wpgppop&year=2020&runasync=false&geojson='
    urlParcialTask = 'https://api.worldpop.org/v1/tasks/'

    urlDeMuestra = 'https://api.worldpop.org/v1/services'

    query = urlParcialPoblacion + json.dumps(poligono)
    
    call = requests.get(url=query)
    jsonRespuesta = call.json()

    if not jsonRespuesta['taskid']:
        return 'Error: No hay taskid'

    taskid = jsonRespuesta['taskid']
    taskCall = requests.get(url=urlParcialTask + taskid)
    
    try:
        taskRespuesta = taskCall.json()
    except ValueError as error:
        return error
    
    if taskRespuesta['error']:
        return taskRespuesta['error_message']

    return taskRespuesta['data']['total_population']

eel.init("frontend")
eel.start('main.html', cmdline_args=['--start-fullscreen'], size=(1280, 720), position=(0,0))
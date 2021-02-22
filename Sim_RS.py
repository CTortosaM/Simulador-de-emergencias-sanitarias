# Carlos Tortosa Micó
# Trabajo final de grado
# Grado en tecnologías interactivas
# Escola Politècnica Superior de Gandía

# 14/12/2020

import eel
import json
import requests
import csv
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
    body = {"locations":[[lat, lng]],"range":[tiempoEnMinutos*60]}

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
    except:
        return None

@eel.expose
def getEstimacionPoblacion(poligono):
    requestData = {
        'polygon': poligono,

    }

    print(requestData)


eel.init("frontend")
eel.start('main.html', cmdline_args=['--start-fullscreen'], size=(1280, 720), position=(0,0))
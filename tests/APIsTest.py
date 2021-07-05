import requests

# Test de WorldPop API:
url = 'https://api.worldpop.org/v1/services/stats?&runasync=false&dataset=wpgppop&amp&year=2010&amp&geojson={"type":"FeatureCollection","features":[{"type":"Feature","properties":{},"geometry":{"type":"Polygon","coordinates":[[[10.546875,47.62097541515849],[9.95361328125,46.437856895024204],[11.315917968749998,45.98169518512228],[12.63427734375,46.66451741754235],[12.65625,47.85740289465826],[10.546875,47.62097541515849]]]}}]}'

respuesta_WorldPop = requests.get(url=url)


assert respuesta_WorldPop.status_code == 200, 'Status: {0}'.format(respuesta_WorldPop.status_code)

elJson = respuesta_WorldPop.json()
assert elJson['error'] == False, 'Ha habido un error en el JSON Worldpop: {0}'.format(elJson['Error'])
assert elJson['status'] == 'finished', 'Tarea aún en proceso'



# Test openRoute
body = {"locations":[[-0.6289672851562501, 38.938048382564126]],"range":[10*60]}

headers = {
    'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
    'Authorization': '5b3ce3597851110001cf6248d90c17ea66a34789876d047afe84449e',
        'Content-Type': 'application/json; charset=utf-8'
}
call = requests.post('https://api.openrouteservice.org/v2/isochrones/driving-car', json=body, headers=headers)
assert call.status_code == 200, 'Error en contacto con OpenRoute'.format(call.status_code)
assert call.json()['type'] and call.json()['type'] == 'FeatureCollection', '{0}'.format(call.json())
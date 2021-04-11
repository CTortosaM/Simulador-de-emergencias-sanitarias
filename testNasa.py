import requests
import json as js

url = 'https://sedac.ciesin.columbia.edu/arcgis/rest/services/sedac/pesv3Broker/GPServer/pesv3Broker/execute?f=json'

headers = {
    "accept-language": "es-ES,es;q=0.9",
    'Content-type': 'application/json',
    'Accept':'application/json'
}
requestData = {
    'polygon': [[-0.5600002645860996, 39.1272762870883], [-0.5602012963916762, 39.12765185148563], [-0.5592264186022798, 39.12931503584611], [-0.558619, 39.12896], [-0.557708, 39.128426]], 
    'variables': ['gpw-v4-population-count-rev10_2020'], 
    'statistics': ['SUM'], 
    'requestID': '123456789'
}
requestData = js.dumps(requestData)
print(requestData)
call = requests.post(url, json=requestData, headers=headers)


print(call.json())
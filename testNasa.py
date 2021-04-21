import urllib,json
from urllib import request as rq
import urllib.parse as par
url = 'https://sedac.ciesin.columbia.edu/arcgis/rest/services/sedac/pesv3Broker/GPServer/pesv3Broker/execute?f=json'

import requests
def pesRequest(p):
    params = par.urlencode(p)
        # execute query
    queryURL = 'https://sedac.ciesin.columbia.edu/arcgis/rest/services/sedac/pesv3Broker/GPServer/pesv3Broker/execute?f=json'
    response = json.loads(rq.urlopen(queryURL,params).read())
    return response

p={"Input_Data":
   {"polygon":[[-13.7109375,59.88893689676585],[135,60.413852350464914],
               [135,4.740675384778373],[-10.72265625,4.390228926463396],
               [-13.7109375,59.88893689676585]],
  "variables":["gpw-v4-population-count-rev10_2020"],
  "statistics":["SUM"],
  "requestID":'12345'}}

call = requests.post(url, data=par.urlencode(p))
print(call.json())
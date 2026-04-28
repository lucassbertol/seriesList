import urllib.request, urllib.error, json
req = urllib.request.Request(
    'http://127.0.0.1:8000/api/series/',
    data=json.dumps({'title':'Test 2','description':'Test','status':'ongoing','grade':9.9,'dateEnded':None}).encode('utf-8'),
    headers={'Content-Type':'application/json'}
)
try:
    urllib.request.urlopen(req)
except urllib.error.HTTPError as e:
    print(e.read().decode('utf-8'))

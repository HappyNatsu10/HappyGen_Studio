import urllib.request, json
url = 'https://civitai.com/api/v1/models?query=Sagging%20Breasts&baseModels=Anima&nsfw=true'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read().decode())
        if data.get('items'):
            for model in data['items']:
                print(f"Model: {model.get('name')}")
                for v in model.get('modelVersions', []):
                    print(f"  Version: {v.get('name')} | BaseModel: {v.get('baseModel')}")
        else:
            print("No items found")
except Exception as e:
    print('Error:', e)

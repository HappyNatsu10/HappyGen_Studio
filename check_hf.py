import requests

repo = "CalamitousFelicitousness/Anima-1.0-Base-Diffusers"
url = f"https://huggingface.co/api/models/{repo}/tree/main"
response = requests.get(url)
for file in response.json():
    print(file['path'])

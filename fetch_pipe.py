import requests
url = "https://huggingface.co/CalamitousFelicitousness/Anima-1.0-Base-Diffusers/raw/main/pipeline.py"
r = requests.get(url)
with open("anima_pipeline.py", "w", encoding="utf-8") as f:
    f.write(r.text)

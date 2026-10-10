import json
import os

with open('kaggle_server.ipynb', 'r', encoding='utf-8') as f:
    d = json.load(f)

# Find Cell 4
cell_4 = None
for c in d['cells']:
    if c['cell_type'] == 'code':
        source = ''.join(c['source'])
        if 'app = FastAPI()' in source and 'def _do_txt2img' in source:
            cell_4 = c
            break

if cell_4:
    original_code = ''.join(cell_4['source'])
    
    # We need to add VAE tiling to Anima in the original code before writing it
    original_code = original_code.replace(
        'pipe = DiffusionPipeline.from_pretrained("CalamitousFelicitousness/Anima-1.0-Base-Diffusers", torch_dtype=torch.bfloat16, trust_remote_code=True, custom_pipeline="CalamitousFelicitousness/Anima-1.0-Base-Diffusers").to("cuda")',
        'pipe = DiffusionPipeline.from_pretrained("CalamitousFelicitousness/Anima-1.0-Base-Diffusers", torch_dtype=torch.bfloat16, trust_remote_code=True, custom_pipeline="CalamitousFelicitousness/Anima-1.0-Base-Diffusers")\n            pipe.vae.enable_tiling()\n            pipe = pipe.to("cuda")'
    )
    
    # Remove the threading/cloudflared part from the worker
    import re
    original_code = re.sub(r'threading\.Thread\(target=lambda: uvicorn\.run\(app, host="0\.0\.0\.0", port=8000, log_level="warning"\), daemon=True\)\.start\(\).*', '', original_code, flags=re.DOTALL)
    
    # Add worker start logic at the bottom
    worker_append = """
import sys
if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 5001
    uvicorn.run(app, host='127.0.0.1', port=port, log_level="warning")
"""
    original_code += worker_append
    
    # Escape triple quotes
    original_code_escaped = original_code.replace('\"\"\"', '\\\"\\\"\\\"')
    
    new_source = f'''import os
import subprocess
import time
from pycloudflared import try_cloudflare
import uvicorn
from fastapi import FastAPI, Request
import httpx
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware

# Write the worker code to a file
with open("worker.py", "w", encoding="utf-8") as f:
    f.write("""{original_code_escaped}""")

print("🚀 Starting Dual GPU Workers...")
# Launch worker 1 on GPU 0
env1 = os.environ.copy()
env1["CUDA_VISIBLE_DEVICES"] = "0"
p1 = subprocess.Popen(["python", "worker.py", "5001"], env=env1)

# Launch worker 2 on GPU 1
env2 = os.environ.copy()
env2["CUDA_VISIBLE_DEVICES"] = "1"
p2 = subprocess.Popen(["python", "worker.py", "5002"], env=env2)

time.sleep(5) # Wait for workers to bind

# --- Master Load Balancer ---
master_app = FastAPI()
master_app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

import itertools
WORKERS = ["http://127.0.0.1:5001", "http://127.0.0.1:5002"]
worker_cycle = itertools.cycle(WORKERS)
client = httpx.AsyncClient(timeout=300.0)

@master_app.api_route("/{{path:path}}", methods=["GET", "POST", "PUT", "DELETE"])
async def route_request(request: Request, path: str):
    target = next(worker_cycle)
    url = f"{{target}}/{{path}}"
    
    req_body = await request.body()
    
    req = client.build_request(
        request.method,
        url,
        headers=request.headers.raw,
        content=req_body
    )
    resp = await client.send(req, stream=True)
    return StreamingResponse(
        resp.aiter_raw(),
        status_code=resp.status_code,
        headers=resp.headers,
    )

import threading
threading.Thread(target=lambda: uvicorn.run(master_app, host="0.0.0.0", port=8000, log_level="warning"), daemon=True).start()

time.sleep(2)
os.system("pkill -f cloudflared")
time.sleep(2)
try:
    tunnel = try_cloudflare(port=8000)
    print(f"\\n🎉 COPY THIS URL: {{tunnel.tunnel}}\\n")
except Exception as e:
    print("Cloudflared failed. Trying LocalTunnel...")
    os.system("npm install -g localtunnel > /dev/null 2>&1")
    p = subprocess.Popen(["lt", "--port", "8000"], stdout=subprocess.PIPE)
    url = p.stdout.readline().decode().strip().split("is: ")[1]
    print(f"\\n🎉 COPY THIS URL: {{url}}\\n")
    print("Go to this URL to find your Kaggle IP: https://ipv4.icanhazip.com/")

# Keep notebook alive
while True:
    time.sleep(60)
'''
    
    cell_4['source'] = [line + ('\n' if i < len(new_source.split('\n')) - 1 else '') for i, line in enumerate(new_source.split('\n'))]

with open('kaggle_server.ipynb', 'w', encoding='utf-8') as f:
    json.dump(d, f, indent=2)

print("Kaggle notebook successfully patched for Dual GPU Load Balancing and VAE Tiling!")

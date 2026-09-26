with open('src/components/generate/InpaintCanvas.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    "wheel={{ step: 0.05, smoothStep: 0.005, disabled: tool !== 'pan' }}",
    "wheel={{ step: 0.1, disabled: tool !== 'pan' }}"
)

content = content.replace(
    '<TransformComponent wrapperClass="w-full h-full flex justify-center items-center">',
    '<TransformComponent wrapperClass="!w-full !h-full flex justify-center items-center" wrapperStyle={{ width: "100%", height: "100%" }}>'
)

content = content.replace(
    '<TransformWrapper\n                      style={{ width: \'100%\', height: \'100%\' }}\n                    initialScale={1}',
    '<TransformWrapper\n                    style={{ width: "100%", height: "100%" }}\n                    initialScale={1}'
)

with open('src/components/generate/InpaintCanvas.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

with open('colab_server.ipynb', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    'is_anima = globals().get("CURRENT_ARCHITECTURE") == "Anima" or "anima" in str(req.base_model).lower()',
    'is_anima = hasattr(pipe, "transformer") and not hasattr(pipe, "unet")'
)

with open('colab_server.ipynb', 'w', encoding='utf-8') as f:
    f.write(content)

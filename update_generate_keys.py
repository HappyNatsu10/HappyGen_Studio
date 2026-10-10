import json
import os

translations = {
    "en": {
        "customSettings": "Using Custom Settings",
        "standardSettings": "Using Standard Settings",
        "saved": "Saved!",
        "saveDefault": "Save as Default"
    },
    "es": {
        "customSettings": "Usando ajustes personalizados",
        "standardSettings": "Usando ajustes estándar",
        "saved": "¡Guardado!",
        "saveDefault": "Guardar por defecto"
    },
    "fr": {
        "customSettings": "Utilisation des paramètres personnalisés",
        "standardSettings": "Utilisation des paramètres standards",
        "saved": "Enregistré !",
        "saveDefault": "Définir par défaut"
    },
    "ja": {
        "customSettings": "カスタム設定を使用中",
        "standardSettings": "標準設定を使用中",
        "saved": "保存しました！",
        "saveDefault": "デフォルトとして保存"
    },
    "ko": {
        "customSettings": "사용자 지정 설정 사용 중",
        "standardSettings": "표준 설정 사용 중",
        "saved": "저장됨!",
        "saveDefault": "기본값으로 저장"
    },
    "zh": {
        "customSettings": "使用自定义设置",
        "standardSettings": "使用标准设置",
        "saved": "已保存！",
        "saveDefault": "保存为默认"
    }
}

def update_generate():
    locales_dir = r"c:\Users\Administrator\Documents\Programming\AI Image Generator\src\locales"
    for lang, trans in translations.items():
        file_path = os.path.join(locales_dir, f"{lang}.json")
        if os.path.exists(file_path):
            with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                
            if "generate" not in data:
                data["generate"] = {}
                
            for k, v in trans.items():
                data["generate"][k] = v
                    
            with open(file_path, "w", encoding="utf-8") as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            print(f"Updated generate translations for {lang}.json")

if __name__ == "__main__":
    update_generate()

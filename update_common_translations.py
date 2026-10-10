import json
import os

translations = {
    "es": {
        "applyAndClose": "Aplicar y Cerrar",
        "usePrompt": "Usar Prompt",
        "download": "Descargar"
    },
    "fr": {
        "applyAndClose": "Appliquer et Fermer",
        "usePrompt": "Utiliser le Prompt",
        "download": "Télécharger"
    },
    "ja": {
        "applyAndClose": "適用して閉じる",
        "usePrompt": "プロンプトを使用",
        "download": "ダウンロード"
    },
    "ko": {
        "applyAndClose": "적용 및 닫기",
        "usePrompt": "프롬프트 사용",
        "download": "다운로드"
    },
    "zh": {
        "applyAndClose": "应用并关闭",
        "usePrompt": "使用提示词",
        "download": "下载"
    }
}

def update_common():
    locales_dir = r"c:\Users\Administrator\Documents\Programming\AI Image Generator\src\locales"
    for lang, trans in translations.items():
        file_path = os.path.join(locales_dir, f"{lang}.json")
        if os.path.exists(file_path):
            with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                
            if "common" in data:
                for k, v in trans.items():
                    data["common"][k] = v
                    
            with open(file_path, "w", encoding="utf-8") as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            print(f"Updated common translations for {lang}.json")

if __name__ == "__main__":
    update_common()

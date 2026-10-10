import json
import os

keys_to_add = {
    "en": {
        "schedule": "Schedule",
        "scheduleTooltip": "The math spacing for steps (Sigma schedule). Karras is highly recommended for realistic models.",
        "autoFaceFix": "Auto-Detect Face Fix",
        "autoFaceFixDesc": "Automatically uses ADetailer (for stylized) or GFPGAN (for realistic) if a face is detected in your prompt. Returns both original and fixed images."
    },
    "es": {
        "schedule": "Horario (Schedule)",
        "scheduleTooltip": "El espaciado matemático de los pasos. Se recomienda Karras para modelos realistas.",
        "autoFaceFix": "Corrección Facial Automática",
        "autoFaceFixDesc": "Usa ADetailer o GFPGAN si detecta un rostro en el prompt. Devuelve ambas imágenes."
    },
    "fr": {
        "schedule": "Planification (Schedule)",
        "scheduleTooltip": "L'espacement mathématique des étapes. Karras est recommandé pour les modèles réalistes.",
        "autoFaceFix": "Correction Faciale Auto",
        "autoFaceFixDesc": "Utilise ADetailer ou GFPGAN si un visage est détecté. Retourne l'original et la version corrigée."
    },
    "ja": {
        "schedule": "スケジュール (Schedule)",
        "scheduleTooltip": "ステップの数学的間隔。リアルなモデルにはKarrasを強く推奨します。",
        "autoFaceFix": "顔の自動修正 (Auto Face Fix)",
        "autoFaceFixDesc": "プロンプトに顔が検出された場合、ADetailerまたはGFPGANを自動的に適用します。"
    },
    "ko": {
        "schedule": "일정 (Schedule)",
        "scheduleTooltip": "단계의 수학적 간격. 사실적인 모델에는 Karras를 강력히 권장합니다.",
        "autoFaceFix": "자동 얼굴 수정",
        "autoFaceFixDesc": "프롬프트에서 얼굴이 감지되면 자동으로 ADetailer 또는 GFPGAN을 사용합니다."
    },
    "zh": {
        "schedule": "调度 (Schedule)",
        "scheduleTooltip": "步数的数学间距。强烈建议现实模型使用Karras。",
        "autoFaceFix": "自动脸部修复",
        "autoFaceFixDesc": "如果在提示词中检测到脸部，将自动使用 ADetailer 或 GFPGAN。"
    }
}

def update_locales():
    locales_dir = r"c:\Users\Administrator\Documents\Programming\AI Image Generator\src\locales"
    for lang in keys_to_add:
        file_path = os.path.join(locales_dir, f"{lang}.json")
        if os.path.exists(file_path):
            with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                
            if "generate" not in data:
                data["generate"] = {}
                
            for k, v in keys_to_add[lang].items():
                data["generate"][k] = v
                
            with open(file_path, "w", encoding="utf-8") as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            print(f"Updated {lang}.json")

if __name__ == "__main__":
    update_locales()

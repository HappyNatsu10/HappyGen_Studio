"""
OmniGen AI Studio - Direct CLI Generator
"""
import os, sys, argparse, time, torch
from diffusers import StableDiffusionXLPipeline, EulerAncestralDiscreteScheduler
from safetensors.torch import load_file

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
MODELS_DIR = os.path.join(ROOT_DIR, "Models")
BASE_MODEL_PATH = os.path.join(MODELS_DIR, "crucibleRINGPonyxl_v28.safetensors")
LIGHTNING_PATH = os.path.join(MODELS_DIR, "sdxl_lightning_4step_lora.safetensors")
NEGATIVE_HANDS_PATH = os.path.join(MODELS_DIR, "NEGATIVE_HANDS.safetensors")

def generate(prompt, output_file="output.png", steps=20, cfg=6.5, seed=None):
    if seed is None:
        seed = int(time.time()) % 1000000

    print(f"[1/3] Loading Crucible RING PonyXL base pipeline...")
    pipe = StableDiffusionXLPipeline.from_single_file(
        BASE_MODEL_PATH,
        torch_dtype=torch.float16,
        use_safetensors=True
    )
    pipe.scheduler = EulerAncestralDiscreteScheduler.from_config(pipe.scheduler.config)

    if os.path.exists(LIGHTNING_PATH):
        print(f"[2/3] Fusing SDXL Lightning 4-Step Acceleration...")
        pipe.load_lora_weights(MODELS_DIR, weight_name="sdxl_lightning_4step_lora.safetensors")
        pipe.fuse_lora()
        pipe.unload_lora_weights()

    if os.path.exists(NEGATIVE_HANDS_PATH):
        sd = load_file(NEGATIVE_HANDS_PATH)
        if "clip_l" in sd and "clip_g" in sd:
            pipe.load_textual_inversion(sd["clip_l"], token="negative_hands", text_encoder=pipe.text_encoder, tokenizer=pipe.tokenizer)
            pipe.load_textual_inversion(sd["clip_g"], token="negative_hands", text_encoder=pipe.text_encoder_2, tokenizer=pipe.tokenizer_2)

    pipe.enable_sequential_cpu_offload()
    pipe.vae.enable_slicing()
    pipe.vae.enable_tiling()

    full_prompt = prompt if "score_9" in prompt else f"score_9, score_8_up, score_7_up, source_anime, {prompt}"
    neg_prompt = "score_4, score_5, score_6, source_pony, source_furry, 3d, realistic, negative_hands, bad hands, malformed hands, extra fingers, missing fingers, fused fingers, mutated hands, bad anatomy, deformed limbs, blurry"

    print(f"[3/3] Generating image ({steps} steps, CFG {cfg}, Seed {seed})...")
    t0 = time.time()
    with torch.inference_mode():
        result = pipe(
            prompt=full_prompt,
            negative_prompt=neg_prompt,
            width=512,
            height=768,
            num_inference_steps=steps,
            guidance_scale=cfg,
            generator=torch.Generator("cpu").manual_seed(seed)
        )
    t1 = time.time()
    out_path = os.path.abspath(output_file)
    result.images[0].save(out_path)
    print(f"[COMPLETE] Image saved to {out_path} in {t1 - t0:.2f}s!")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="OmniGen Direct CLI Generator")
    parser.add_argument("--prompt", type=str, required=True, help="Generation prompt")
    parser.add_argument("--output", type=str, default="output.png", help="Output PNG path")
    parser.add_argument("--steps", type=int, default=20, help="Inference steps")
    parser.add_argument("--cfg", type=float, default=6.5, help="Guidance scale")
    parser.add_argument("--seed", type=int, default=None, help="Random seed")
    args = parser.parse_args()
    generate(args.prompt, args.output, args.steps, args.cfg, args.seed)

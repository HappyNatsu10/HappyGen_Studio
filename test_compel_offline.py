import torch
from diffusers import StableDiffusionXLPipeline
from compel import Compel, ReturnedEmbeddingsType
import traceback

print("Loading SDXL...")
pipe = StableDiffusionXLPipeline.from_pretrained("stabilityai/stable-diffusion-xl-base-1.0", torch_dtype=torch.float16, use_safetensors=True)

prompt_str = "score_9, score_8_up, score_7_up, score_6_up, source_anime, masterpiece, best quality, expressive eyes, perfect face, 1girl, solo, long hair, breasts, looking at viewer, blush, smile, open mouth, bangs, large breasts, hair ornament, cleavage, sitting, green eyes, collarbone, pink hair, flower, :d, sidelocks, thighs, sweat, hair flower, armpits, hair bun, mole, huge breasts, arms up, wet, parted bangs, mole under eye, single hair bun, towel, steam, arms behind head, wooden floor, towel, wooden wall, sauna"
req_negative_prompt = "score_4, score_5, score_6, source_pony, source_furry, source_cartoon"

print("Running compel logic...")
try:
    compel_proc = Compel(
        tokenizer=[pipe.tokenizer, pipe.tokenizer_2], 
        text_encoder=[pipe.text_encoder, pipe.text_encoder_2], 
        returned_embeddings_type=ReturnedEmbeddingsType.PENULTIMATE_HIDDEN_STATES_NON_NORMALIZED, 
        requires_pooled=[False, True], 
        truncate_long_prompts=False, 
        device=pipe.device
    )
    cond, pooled = compel_proc(prompt_str)
    neg_cond, neg_pooled = compel_proc(req_negative_prompt or "")
    
    cond, neg_cond = compel_proc.pad_conditioning_tensors_to_same_length([cond, neg_cond])
    
    if isinstance(pooled, list): pooled = [p for p in pooled if p is not None][0]
    if isinstance(neg_pooled, list): neg_pooled = [p for p in neg_pooled if p is not None][0]
    
    kwargs = {"prompt_embeds": cond, "pooled_prompt_embeds": pooled, "negative_prompt_embeds": neg_cond, "negative_pooled_prompt_embeds": neg_pooled}
    print("SUCCESS!")
    print("cond shape:", cond.shape)
    print("neg_cond shape:", neg_cond.shape)
    print("pooled shape:", pooled.shape)
except Exception as e:
    print("EXCEPTION CAUGHT!")
    traceback.print_exc()

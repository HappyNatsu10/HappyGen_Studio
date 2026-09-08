import torch
from diffusers import StableDiffusionXLPipeline
from compel import Compel, ReturnedEmbeddingsType
import traceback

print("Loading Tiny SDXL...")
pipe = StableDiffusionXLPipeline.from_pretrained("briaai/tiny-sdxl", torch_dtype=torch.float16, use_safetensors=True)

prompt_str = "score_9, score_8_up, score_7_up, score_6_up, source_anime, masterpiece, best quality, expressive eyes, perfect face, 1girl, solo, long hair, breasts, looking at viewer, blush, smile, open mouth, bangs, large breasts, hair ornament, cleavage, sitting, green eyes, collarbone, pink hair, flower, :d, sidelocks, thighs, sweat, hair flower, armpits, hair bun, mole, huge breasts, arms up, wet, parted bangs, mole under eye, single hair bun, towel, steam, arms behind head, wooden floor, towel, wooden wall, sauna"
req_negative_prompt = "score_4, score_5, score_6, source_pony, source_furry, source_cartoon"

try:
    print("Testing Compel with Tiny SDXL...")
    compel_proc = Compel(tokenizer=[pipe.tokenizer, pipe.tokenizer_2], text_encoder=[pipe.text_encoder, pipe.text_encoder_2], returned_embeddings_type=ReturnedEmbeddingsType.PENULTIMATE_HIDDEN_STATES_NON_NORMALIZED, requires_pooled=[False, True], truncate_long_prompts=False, device=pipe.device)
    cond, pooled = compel_proc(prompt_str)
    neg_cond, neg_pooled = compel_proc(req_negative_prompt or "")
    
    cond, neg_cond = compel_proc.pad_conditioning_tensors_to_same_length([cond, neg_cond])
    
    def extract_pool(p):
        if hasattr(p, 'shape'): return p
        if isinstance(p, (list, tuple)):
            valid = [x for x in p if x is not None and hasattr(x, 'shape')]
            if valid: return valid[0]
        return None
        
    pooled_ext = extract_pool(pooled)
    neg_pooled_ext = extract_pool(neg_pooled)
    
    print(f"cond shape: {cond.shape}")
    print(f"pooled_ext type: {type(pooled_ext)}")
    if pooled_ext is not None:
        print(f"pooled_ext shape: {pooled_ext.shape}")
        
    if pooled_ext is None or neg_pooled_ext is None:
        print("Fallback to encode_prompt...")
        _, _, p_emb, np_emb = pipe.encode_prompt(prompt=prompt_str, prompt_2=prompt_str, device=pipe.device, num_images_per_prompt=1, do_classifier_free_guidance=True, negative_prompt=req_negative_prompt or "", negative_prompt_2=req_negative_prompt or "")
        pooled_ext = p_emb if pooled_ext is None else pooled_ext
        neg_pooled_ext = np_emb if neg_pooled_ext is None else neg_pooled_ext
        print(f"After fallback, pooled_ext type: {type(pooled_ext)}")
        
    kwargs = {"prompt_embeds": cond, "pooled_prompt_embeds": pooled_ext, "negative_prompt_embeds": neg_cond, "negative_pooled_prompt_embeds": neg_pooled_ext}
    
    print("Passing to pipeline...")
    _ = pipe(**kwargs, num_inference_steps=1).images[0]
    print("SUCCESS!")
    
except Exception as e:
    print("CRASHED!")
    traceback.print_exc()

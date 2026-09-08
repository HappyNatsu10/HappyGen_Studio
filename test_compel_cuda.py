import torch
from diffusers import StableDiffusionXLPipeline
from compel import Compel, ReturnedEmbeddingsType
import traceback

try:
    print("Loading pipeline...")
    pipe = StableDiffusionXLPipeline.from_pretrained("stabilityai/stable-diffusion-xl-base-1.0", torch_dtype=torch.float16, use_safetensors=True).to("cuda")

    print("Initializing Compel...")
    compel_proc = Compel(
        tokenizer=[pipe.tokenizer, pipe.tokenizer_2], 
        text_encoder=[pipe.text_encoder, pipe.text_encoder_2], 
        returned_embeddings_type=ReturnedEmbeddingsType.PENULTIMATE_HIDDEN_STATES_NON_NORMALIZED, 
        requires_pooled=[False, True],
        truncate_long_prompts=False,
        device=pipe.device
    )

    print("Encoding prompt...")
    prompt = "score_9, score_8_up, score_7_up, score_6_up, source_anime, masterpiece, best quality, expressive eyes, perfect face, 1girl, solo, long hair, breasts, looking at viewer, blush, smile, open mouth, bangs, large breasts, hair ornament, cleavage, sitting, green eyes, collarbone, pink hair, flower, :d, sidelocks, thighs, sweat, hair flower, armpits, hair bun, mole, huge breasts, arms up, wet, parted bangs, mole under eye, single hair bun, towel, steam, arms behind head, wooden floor, towel, wooden wall, sauna"
    cond, pooled = compel_proc(prompt)

    print("Success!")
    print("cond shape:", cond.shape)
    
except Exception as e:
    print("FAILED!")
    traceback.print_exc()

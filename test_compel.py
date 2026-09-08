import torch
from diffusers import StableDiffusionXLPipeline
from compel import Compel, ReturnedEmbeddingsType

pipe = StableDiffusionXLPipeline.from_pretrained("stabilityai/stable-diffusion-xl-base-1.0", torch_dtype=torch.float16, use_safetensors=True).to("cuda")

compel_proc = Compel(
    tokenizer=[pipe.tokenizer, pipe.tokenizer_2], 
    text_encoder=[pipe.text_encoder, pipe.text_encoder_2], 
    returned_embeddings_type=ReturnedEmbeddingsType.PENULTIMATE_HIDDEN_STATES_NON_NORMALIZED, 
    requires_pooled=[False, True]
)

cond, pooled = compel_proc("a cat playing with a ball")
print("cond type:", type(cond))
print("pooled type:", type(pooled))
if isinstance(pooled, torch.Tensor):
    print("pooled shape:", pooled.shape)

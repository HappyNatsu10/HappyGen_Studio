import torch
from transformers import CLIPTokenizer, CLIPTextConfig, CLIPTextModel, CLIPTextModelWithProjection
from compel import Compel, ReturnedEmbeddingsType

t1 = CLIPTokenizer.from_pretrained('stabilityai/stable-diffusion-xl-base-1.0', subfolder='tokenizer')
c1 = CLIPTextConfig.from_pretrained('stabilityai/stable-diffusion-xl-base-1.0', subfolder='text_encoder')
e1 = CLIPTextModel(c1)

t2 = CLIPTokenizer.from_pretrained('stabilityai/stable-diffusion-xl-base-1.0', subfolder='tokenizer_2')
c2 = CLIPTextConfig.from_pretrained('stabilityai/stable-diffusion-xl-base-1.0', subfolder='text_encoder_2')
e2 = CLIPTextModelWithProjection(c2)

compel_proc = Compel(tokenizer=[t1, t2], text_encoder=[e1, e2], returned_embeddings_type=ReturnedEmbeddingsType.PENULTIMATE_HIDDEN_STATES_NON_NORMALIZED, requires_pooled=[False, True])

cond, pooled = compel_proc("test")
print("COND:", type(cond))
if isinstance(cond, torch.Tensor): print("COND SHAPE:", cond.shape)
if isinstance(cond, tuple): print("COND LEN:", len(cond))

print("POOLED:", type(pooled))
if isinstance(pooled, torch.Tensor): print("POOLED SHAPE:", pooled.shape)
if isinstance(pooled, list): print("POOLED LEN:", len(pooled))
if isinstance(pooled, tuple): print("POOLED LEN:", len(pooled))
if pooled is None: print("POOLED IS NONE")

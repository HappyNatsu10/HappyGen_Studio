export const VIDEO_ENGINES = [
  {
    provider: 'OPENAI',
    isClosed: true,
    models: [
      { id: 'sora_2', name: 'Sora 2', badge: 'New' },
      { id: 'sora', name: 'Sora' }
    ]
  },
  {
    provider: 'RUNWAY',
    isClosed: true,
    models: [
      { id: 'gen_3_alpha', name: 'Gen-3 Alpha' },
      { id: 'gen_2', name: 'Gen-2' }
    ]
  },
  {
    provider: 'LUMA AI',
    isClosed: true,
    models: [
      { id: 'dream_machine', name: 'Dream Machine' }
    ]
  },
  {
    provider: 'PIKA LABS',
    isClosed: true,
    models: [
      { id: 'pika_1', name: 'Pika 1.0' }
    ]
  },
  {
    provider: 'STABILITY AI',
    models: [
      { id: 'svd_xt', name: 'Stable Video Diffusion XT' }
    ]
  },
  {
    provider: 'BLACK FOREST LABS',
    models: [
      { id: 'flux_3_video', name: 'Flux 3 Video' }
    ]
  },
  {
    provider: 'KUAISHOU',
    isClosed: true,
    models: [
      { id: 'kling', name: 'Kling' }
    ]
  },
  {
    provider: 'GOOGLE',
    isClosed: true,
    models: [
      { id: 'veo_3', name: 'Veo 3' },
      { id: 'lumiere', name: 'Lumiere' }
    ]
  },
  {
    provider: 'ALIBABA',
    models: [
      { id: 'wan_video', name: 'Wan Video' }
    ]
  },
  {
    provider: 'ALIBABA - TAOTIAN',
    models: [
      { id: 'happyhorse', name: 'HappyHorse' }
    ]
  },
  {
    provider: 'LIGHTRICKS',
    isClosed: true,
    models: [
      { id: 'ltx_video', name: 'LTX Video' }
    ]
  },
  {
    provider: 'SHENGSHU TECHNOLOGY',
    isClosed: true,
    models: [
      { id: 'vidu', name: 'Vidu' }
    ]
  },
  {
    provider: 'HAIPER',
    isClosed: true,
    models: [
      { id: 'haiper_v1', name: 'Haiper V1' }
    ]
  }
];

export const IMAGE_ENGINES = [
  {
    provider: 'ALIBABA',
    models: [
      { id: 'wan_image', name: 'Wan Image' },
      { id: 'qwen', name: 'Qwen', badge: '🧪' },
      { id: 'qwen_2', name: 'Qwen 2' },
      { id: 'qwen_3', name: 'Qwen 3' }
    ]
  },
  {
    provider: 'ALIBABA - TONGYI LAB',
    models: [
      { id: 'zimage', name: 'ZImage' }
    ]
  },
  {
    provider: 'BAIDU',
    isClosed: true,
    models: [
      { id: 'ernie', name: 'Ernie' }
    ]
  },
  {
    provider: 'BLACK FOREST LABS',
    models: [
      { id: 'flux_1', name: 'Flux.1' },
      { id: 'flux_1_krea', name: 'Flux.1 Krea' },
      { id: 'flux_1_kontext', name: 'Flux.1 Kontext' },
      { id: 'flux_2', name: 'Flux.2' },
      { id: 'flux_2_klein', name: 'Flux.2 Klein' }
    ]
  },
  {
    provider: 'BOOGU',
    models: [
      { id: 'boogu', name: 'Boogu' }
    ]
  },
  {
    provider: 'BYTEDANCE',
    isClosed: true,
    models: [
      { id: 'seedream', name: 'Seedream' }
    ]
  },
  {
    provider: 'GOOGLE',
    isClosed: true,
    models: [
      { id: 'imagen_4', name: 'Imagen 4' },
      { id: 'nano_banana', name: 'Nano Banana' }
    ]
  },
  {
    provider: 'HIDREAM',
    models: [
      { id: 'hidream', name: 'HiDream' },
      { id: 'hidream_o1', name: 'HiDream-O1' }
    ]
  },
  {
    provider: 'KREA AI',
    models: [
      { id: 'krea_2', name: 'Krea 2' }
    ]
  },
  {
    provider: 'MICROSOFT',
    isClosed: true,
    models: [
      { id: 'mai', name: 'MAI' },
      { id: 'mage_flow', name: 'Mage Flow' }
    ]
  },
  {
    provider: 'OPENAI',
    isClosed: true,
    models: [
      { id: 'openai', name: 'OpenAI' },
      { id: 'dall_e_3', name: 'DALL-E 3' }
    ]
  },
  {
    provider: 'PONY DIFFUSION',
    models: [
      { id: 'pony_diffusion', name: 'Pony Diffusion' },
      { id: 'pony_diffusion_v7', name: 'Pony Diffusion V7' }
    ]
  },
  {
    provider: 'REVE AI',
    models: [
      { id: 'reve', name: 'Reve' }
    ]
  },
  {
    provider: 'SDXL COMMUNITY',
    models: [
      { id: 'illustrious', name: 'Illustrious' },
      { id: 'noobai', name: 'NoobAI' }
    ]
  },
  {
    provider: 'STABILITY AI',
    models: [
      { id: 'sd_1_x', name: 'Stable Diffusion 1.x' },
      { id: 'sdxl', name: 'Stable Diffusion XL' }
    ]
  },
  {
    provider: 'XAI',
    isClosed: true,
    models: [
      { id: 'grok', name: 'Grok' }
    ]
  },
  {
    provider: 'OTHER',
    models: [
      { id: 'anima', name: 'Anima' },
      { id: 'chroma', name: 'Chroma' },
      { id: 'lens', name: 'Lens' }
    ]
  }
];

export const isEngineClosed = (engineId) => {
  for (const group of [...VIDEO_ENGINES, ...IMAGE_ENGINES]) {
    if (group.models.find(m => m.id === engineId)) {
      return !!group.isClosed;
    }
  }
  return false;
};

export const mapEngineToCivitAIBase = (engineId) => {
  if (!engineId) return 'All';
  if (engineId.includes('flux_1')) return 'Flux.1 D';
  if (engineId.includes('flux_2')) return 'Flux.1 D'; // CivitAI might not have 2.0 yet
  if (engineId === 'sdxl' || engineId === 'svd_xt') return 'SDXL 1.0';
  if (engineId === 'sd_1_x' || engineId === 'sd_1_5') return 'SD 1.5';
  if (engineId.includes('pony')) return 'Pony';
  if (engineId === 'illustrious') return 'Illustrious';
  return 'All'; // Fallback if no specific civitai tag matches
};

export const ART_STYLES = [
  {
    id: 'none',
    name: 'Raw / Default',
    category: 'General',
    description: 'Natural prompt interpretation without preset styling filters.',
    icon: '✨',
    badge: 'Standard',
    promptSuffix: ', detailed, 8k resolution',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'illustrious-anime',
    name: 'Illustrious-XL Masterpiece',
    category: 'Illustrious & Pony',
    description: 'Stellar Ritual & NAI Illustrious-XL anime style with vibrant colors & fine lineart.',
    icon: '💎',
    badge: 'Illustrious-XL',
    promptSuffix: ', illustrious-xl style, stellar ritual ring, highly detailed anime artwork, vibrant colors, masterwork lineart, 8k resolution',
    image: '/styles/custom_anime_illustrious.jpg'
  },
  {
    id: 'pony-xl-mature',
    name: 'PonyXL High Quality',
    category: 'Illustrious & Pony',
    description: 'PonyXL / Anima v4 pipeline (score_9, score_8_up, score_7_up, high detail).',
    icon: '🦄',
    badge: 'PonyXL',
    promptSuffix: ', ponyxl style, score_9, score_8_up, score_7_up, mature female, detailed anatomy, masterpiece, 8k',
    image: '/styles/custom_ponyxl_mature.jpg'
  },
  {
    id: 'clean-manhwa',
    name: 'Clean Manhwa Webtoon',
    category: 'Pixiv & Anime',
    description: 'Dear You clean Korean manhwa webtoon aesthetic with crisp linework.',
    icon: '📖',
    badge: 'Manhwa',
    promptSuffix: ', clean manhwa style, webtoon illustration, crisp lines, modern Korean manhwa art, dramatic shading, masterpiece',
    image: '/styles/custom_manhwa_style.jpg'
  },
  {
    id: 'niji-midjourney',
    name: 'Niji Siji / Midjourney V6',
    category: 'Digital',
    description: 'Niji・journey style with Midjourney V6 rich lighting & wallpaper aesthetic.',
    icon: '🌌',
    badge: 'Niji V6',
    promptSuffix: ', niji journey style, midjourney v6 aesthetic, wallpaper artwork, dramatic lighting, 8k resolution',
    image: '/styles/custom_niji_midjourney.jpg'
  },
  {
    id: 'novelai-kk77',
    name: 'NovelAI KK77 Style',
    category: 'Pixiv & Anime',
    description: 'NovelAI YesMix5 & KKStyle KK77 fine lineart and vibrant eye highlights.',
    icon: '✨',
    badge: 'NovelAI',
    promptSuffix: ', novelai kk77 style, yesmix5, fine lineart, detailed eyes, masterwork anime, wallpaper quality',
    image: '/styles/pixiv_anime.jpg'
  },
  {
    id: 'blue-archive',
    name: 'Blue Archive Art Style',
    category: 'Pixiv & Anime',
    description: 'KREA 2 / Blue Archive bright anime lighting & clean vector shading.',
    icon: '🎓',
    badge: 'Blue Archive',
    promptSuffix: ', blue archive art style, krea 2, bright anime lighting, clean vector shading, masterpiece',
    image: '/styles/pixiv_pastel.jpg'
  },
  {
    id: 'pixiv-anime',
    name: 'Pixiv Masterpiece Anime',
    category: 'Pixiv & Anime',
    description: 'Top ranked Pixiv illustration with celestial bloom & Makoto Shinkai lighting.',
    icon: '🌸',
    badge: 'Pixiv Top',
    promptSuffix: ', highly detailed anime illustration, Makoto Shinkai lighting, celestial bloom, flawless lineart, 8k resolution',
    image: '/styles/pixiv_anime.jpg'
  },
  {
    id: 'deviantart-concept',
    name: 'DeviantArt Matte Concept',
    category: 'DeviantArt & Fantasy',
    description: 'Epic digital matte painting and frontpage concept artwork.',
    icon: '🎨',
    badge: 'DeviantArt Featured',
    promptSuffix: ', epic digital matte painting, atmospheric perspective, cinematic lighting, ArtStation concept art, masterpiece 8k',
    image: '/styles/deviantart_concept.jpg'
  },
  {
    id: 'pixiv-mecha',
    name: 'Pixiv Mecha & Cyber Armor',
    category: 'Pixiv & Anime',
    description: 'Futuristic Gundam-style sci-fi armor with glossy panels and glowing energy lines.',
    icon: '🤖',
    badge: 'Pixiv Sci-Fi',
    promptSuffix: ', pixiv mecha style, gundam aesthetic, glowing energy lines, glossy metal armor, sharp technical details, sci-fi concept, high resolution 8k',
    image: '/styles/pixiv_mecha.jpg'
  },
  {
    id: 'deviantart-dark',
    name: 'DeviantArt Dark Gothic',
    category: 'DeviantArt & Fantasy',
    description: 'Haunting surrealist biomechanical artwork inspired by Beksiński & H.R. Giger.',
    icon: '💀',
    badge: 'Dark Art',
    promptSuffix: ', Beksiński surrealism, bio-mechanical architecture, glowing red mist, haunting atmosphere, dark gothic masterwork, 8k',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'deviantart-splash',
    name: 'DeviantArt Splash Art',
    category: 'DeviantArt & Fantasy',
    description: 'Dynamic Riot Games style character action pose with spell particle effects.',
    icon: '⚡',
    badge: 'Epic Splash',
    promptSuffix: ', Riot Games splash art style, dynamic action pose, elemental spell effects, cinematic game character illustration, high detail, masterpiece',
    image: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'photorealistic',
    name: 'Photorealistic 8K',
    category: 'Realism',
    description: 'Hyper-realistic photography, sharp focus, 85mm f/1.4 lens lighting.',
    icon: '📸',
    badge: 'Popular',
    promptSuffix: ', photorealistic, 8k UHD, highly detailed, shot on 35mm lens, f/1.8, cinematic lighting, ultra sharp, masterpiece',
    image: '/styles/photorealistic.jpg'
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk Neon',
    category: 'Sci-Fi',
    description: 'Futuristic neon-drenched dystopian cityscape & glowing tech accents.',
    icon: '🏙️',
    badge: 'Hot',
    promptSuffix: ', cyberpunk aesthetic, neon lights, volumetric fog, futuristic city, blade runner style, raytracing reflections, dark atmosphere',
    image: '/styles/cyberpunk.jpg'
  },
  {
    id: '3d-render',
    name: '3D Octane / Unreal',
    category: 'Digital',
    description: 'Subsurface scattering, realistic materials, Unreal Engine 5 render.',
    icon: '💎',
    badge: '3D Studio',
    promptSuffix: ', 3D render, octane render, Unreal Engine 5, raytraced lighting, subsurface scattering, smooth clay and glass materials, 8k',
    image: '/styles/3d_render.jpg'
  }
];

// Python Safetensors Metadata Parsed Activation Triggers & Base Model Classifications
export const LOCAL_BASE_MODELS = [
  {
    id: 'crucibleRINGPonyxl_v28.safetensors',
    name: 'Crucible RING PonyXL v28 (User Base)',
    type: 'PonyXL / SDXL',
    description: '6.62 GB Full Native PonyXL Base Checkpoint (High Quality & Detail)',
    recommendedSteps: 8
  },
  {
    id: 'Lykon/dreamshaper-8',
    name: 'DreamShaper 8 (Fast Turbo Engine)',
    type: 'SD 1.5',
    description: '1.8 GB Ultra-Fast Engine (~15-20 sec per image on 4GB GTX 1050)',
    recommendedSteps: 20
  }
];

export const LOCAL_MODELS_FOLDER_LORAS = [
  { 
    id: 'MatureFemalePony.safetensors', 
    name: 'Mature Female Pony (SDXL)', 
    category: 'Character / PonyXL', 
    baseModel: 'sdxl',
    isCompatible: true,
    trigger: 'mature female, 1girl, solo, detailed body, high quality' 
  },
  { 
    id: 'sagging-anima-v4.1.safetensors', 
    name: 'Sagging Anima v4.1 (SDXL)', 
    category: 'Anima / SDXL', 
    baseModel: 'sdxl',
    isCompatible: true,
    trigger: 'sagging anima v4.1, 1girl, solo, large breasts, long hair' 
  },
  { 
    id: 'sagging-anima-v4.0.safetensors', 
    name: 'Sagging Anima v4.0 (SDXL)', 
    category: 'Anima / SDXL', 
    baseModel: 'sdxl',
    isCompatible: true,
    trigger: 'sagging anima v4.0, 1girl, solo, large breasts, long hair' 
  },
  { 
    id: 'NEGATIVE_HANDS.safetensors', 
    name: 'NEGATIVE_HANDS (Dual-CLIP)', 
    category: 'Safety & Anatomy', 
    baseModel: 'sdxl',
    isCompatible: true,
    trigger: 'negative_hands' 
  },
  { 
    id: 'sdxl_lightning_4step_lora.safetensors', 
    name: 'SDXL Lightning 4-Step Acceleration', 
    category: 'Speed / Accelerator', 
    baseModel: 'sdxl',
    isCompatible: true,
    trigger: '' 
  }
];

export const AI_MODELS = [
  { id: 'illustrious-xl', name: 'Illustrious-XL / NAI Engine', badge: 'Illustrious-XL', description: 'Stellar Ritual & NAI Illustrious anime model pipeline.' },
  { id: 'pony-xl', name: 'PonyXL / Anima v4 Engine', badge: 'PonyXL', description: 'Crucible RING, MatureFemalePony & Hyakkano LoRAs.' },
  { id: 'flux', name: 'FLUX.1-Dev Engine', badge: 'Ultra Quality', description: 'State-of-the-art text fidelity and anatomical accuracy.' },
  { id: 'niji-midjourney', name: 'Niji Siji / Midjourney V6', badge: 'Niji V6', description: 'Niji-journey aesthetic with Midjourney V6 lighting.' },
  { id: 'flux-anime', name: 'Pixiv Anime Engine', badge: 'Anime Specialist', description: 'Trained on high-rank Pixiv & Japanese illustration datasets.' },
  { id: 'flux-realism', name: 'FLUX Realism Engine', badge: 'Photorealistic', description: 'Studio camera lighting, skin texture, and optical depth of field.' },
  { id: 'sdxl-turbo', name: 'SDXL Lightning Engine', badge: 'Ultra Fast', description: 'High speed generation under 2 seconds.' },
];

export const ASPECT_RATIOS = [
  { id: '1:1', name: 'Square 1:1', width: 1024, height: 1024, icon: 'Square' },
  { id: '16:9', name: 'Widescreen 16:9', width: 1280, height: 720, icon: 'Monitor' },
  { id: '9:16', name: 'Mobile Story 9:16', width: 720, height: 1280, icon: 'Smartphone' },
  { id: '4:3', name: 'Classic 4:3', width: 1024, height: 768, icon: 'Tv' },
  { id: '3:2', name: 'Photo 3:2', width: 1080, height: 720, icon: 'Camera' },
];

export const VIDEO_CAMERA_MOTIONS = [
  { id: 'static', name: 'Static Locked', description: 'Fixed camera position with internal scene motion' },
  { id: 'pan_left', name: 'Pan Left', description: 'Smooth horizontal leftward camera movement' },
  { id: 'pan_right', name: 'Pan Right', description: 'Smooth horizontal rightward camera movement' },
  { id: 'zoom_in', name: 'Zoom In', description: 'Dynamic forward lens zoom towards subject' },
  { id: 'zoom_out', name: 'Zoom Out', description: 'Gradual backward reveal zoom out' },
  { id: 'orbit', name: '360° Orbit', description: 'Cinematic rotational camera flight around focal point' },
];

export const PROMPT_SUGGESTIONS = [
  {
    category: '💎 Illustrious-XL & PonyXL Trends',
    tags: [
      'Stellar ritual ring, illustrious-xl style masterpiece anime artwork',
      'PonyXL score_9, score_8_up mature female fantasy warrior with glowing aura',
      'NovelAI KK77 style YesMix5 anime girl under starlight bloom',
      'Blue Archive art style KREA 2 cute student with halo and glowing eyes'
    ]
  },
  {
    category: '📖 Manhwa & Niji Midjourney',
    tags: [
      'Clean manhwa style webtoon protagonist with crisp lineart and dramatic fog',
      'Niji journey Midjourney V6 celestial anime wallpaper with rich lighting',
      'MiaoMiao 3D harem style octane render character illustration',
      'Amateur Ichinagogo realistic portrait with natural studio lighting'
    ]
  },
  {
    category: '🎥 Lighting & Camera Angles',
    tags: [
      'Dramatic chiaroscuro studio lighting, 85mm f/1.4 lens bokeh',
      'Volumetric rim lighting with gold dust bloom and raytracing',
      'Low angle dynamic hero shot with wide lens perspective',
      'Bioluminescent underwater glow with caustic light refractions'
    ]
  },
  {
    category: '🌌 Unreal & Octane Environments',
    tags: [
      'Overgrown futuristic greenhouse city in post-apocalyptic forest',
      'Floating crystal islands above a sea of pink clouds',
      'Ancient Mayan pyramid covered in glowing alien runes',
      'Sub-zero arctic laboratory inside ice cavern'
    ]
  }
];

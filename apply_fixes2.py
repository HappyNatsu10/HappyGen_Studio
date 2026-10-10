import os
import re

# 1. Update GeneratePage.jsx
gen_path = 'src/components/generate/GeneratePage.jsx'
with open(gen_path, 'r', encoding='utf-8') as f:
    gen_content = f.read()

# Add queue logic
old_handle_gen = '''const handleGenerate = async () => {
    if ((generationMode !== 'upscale' && generationMode !== 'facefix' && generationMode !== 'interrogate') && !prompt.trim()) return;'''

new_handle_gen = '''const handleGenerate = async () => {
    if (isGenerating) {
      if (!window.confirm("An image is already generating in the background. Would you like to cancel it and start a new one? (Clicking cancel will wait for the current generation)")) {
        return;
      }
    }
    if ((generationMode !== 'upscale' && generationMode !== 'facefix' && generationMode !== 'interrogate') && !prompt.trim()) return;'''

if old_handle_gen in gen_content:
    gen_content = gen_content.replace(old_handle_gen, new_handle_gen)
else:
    print("Could not find handleGenerate block to replace.")

with open(gen_path, 'w', encoding='utf-8') as f:
    f.write(gen_content)


# 2. Update GalleryProjects.jsx
gal_path = 'src/components/GalleryProjects.jsx'
with open(gal_path, 'r', encoding='utf-8') as f:
    gal_content = f.read()

floating_btn = '''
      {/* Floating Select Button */}
      {!isSelectionMode && groupedAssets.length > 0 && activeTab === 'general' && (
        <button 
          onClick={() => setIsSelectionMode(true)}
          className="fixed bottom-24 right-6 z-40 bg-[#a855f7] text-white px-5 py-3 rounded-full shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:bg-[#9333ea] transition-all transform hover:scale-105 flex items-center justify-center gap-2 font-semibold"
        >
          <CheckSquare className="w-5 h-5" /> Select Mode
        </button>
      )}
'''

loading_overlay = '''
      {isDeleting && (
        <div className="fixed inset-0 z-[1000] flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-12 h-12 border-4 border-[#a855f7] border-t-transparent rounded-full animate-spin mb-4"></div>
          <div className="text-white font-semibold tracking-widest uppercase text-sm">Deleting...</div>
        </div>
      )}
'''

# We will inject these right before the final </div>
if "Floating Select Button" not in gal_content:
    # Find the last </div>
    idx = gal_content.rfind('</div>')
    if idx != -1:
        gal_content = gal_content[:idx] + floating_btn + loading_overlay + gal_content[idx:]

with open(gal_path, 'w', encoding='utf-8') as f:
    f.write(gal_content)

print("Applied fixes properly!")

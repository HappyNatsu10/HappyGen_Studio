import os

# 1. Update useGenerateStore.js to add isGenerating and queue
store_path = 'src/store/useGenerateStore.js'
with open(store_path, 'r', encoding='utf-8') as f:
    store_content = f.read()

if 'isGenerating' not in store_content:
    store_content = store_content.replace('prompt: \'\',', "isGenerating: false,\n  setIsGenerating: (isGenerating) => set({ isGenerating }),\n  \n  prompt: '',")
    with open(store_path, 'w', encoding='utf-8') as f:
        f.write(store_content)


# 2. Update GeneratePage.jsx
gen_path = 'src/components/generate/GeneratePage.jsx'
with open(gen_path, 'r', encoding='utf-8') as f:
    gen_content = f.read()

# Replace local isGenerating with global store
gen_content = gen_content.replace(
    'const [isGenerating, setIsGenerating] = useState(false);',
    'const { isGenerating, setIsGenerating } = useGenerateStore();'
)

# Replace the beginning of handleGenerate to include the check
old_handle_gen = '''const handleGenerate = async () => {
    if (generationMode !== 'upscale' && generationMode !== 'facefix' && generationMode !== 'interrogate' && !prompt.trim()) return;'''

new_handle_gen = '''const handleGenerate = async () => {
    if (isGenerating) {
      if (!window.confirm("An image is already generating in the background. Would you like to cancel it and start a new one? (Clicking cancel will wait for the current generation)")) {
        return;
      }
    }
    if (generationMode !== 'upscale' && generationMode !== 'facefix' && generationMode !== 'interrogate' && !prompt.trim()) return;'''

if old_handle_gen in gen_content:
    gen_content = gen_content.replace(old_handle_gen, new_handle_gen)
else:
    # Try alternate spacing
    alt_old_handle_gen = '''const handleGenerate = async () => {
    if (!prompt.trim()'''
    alt_new_handle_gen = '''const handleGenerate = async () => {
    if (isGenerating) {
      if (!window.confirm("An image is already generating in the background. Would you like to cancel it and start a new one? (Clicking cancel will wait for the current generation)")) {
        return;
      }
    }
    if (!prompt.trim()'''
    gen_content = gen_content.replace(alt_old_handle_gen, alt_new_handle_gen)

# Ensure incrementGeneratedCount works safely
gen_content = gen_content.replace('incrementGeneratedCount(images.length);', 'if (images && images.length) incrementGeneratedCount(images.length);')

with open(gen_path, 'w', encoding='utf-8') as f:
    f.write(gen_content)


# 3. Update GalleryProjects.jsx
gal_path = 'src/components/GalleryProjects.jsx'
with open(gal_path, 'r', encoding='utf-8') as f:
    gal_content = f.read()

# Fix Navigation
gal_content = gal_content.replace('setActiveViewerImages(group);', 'setActiveViewerImages(filteredAssets);')

# Floating Select Button
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
if "Floating Select Button" not in gal_content:
    gal_content = gal_content.replace('</ImageViewerModal>', '</ImageViewerModal>\n' + floating_btn)

# Add loading state for delete
if "const [isDeleting, setIsDeleting] = useState(false);" not in gal_content:
    gal_content = gal_content.replace('const [imageToDelete, setImageToDelete] = useState(null);', 'const [imageToDelete, setImageToDelete] = useState(null);\n  const [isDeleting, setIsDeleting] = useState(false);')

# Fix delete handler
old_delete = '''const handleDeleteSelected = () => {
    if (selectedIds.size === 0) return;
    selectedIds.forEach(id => {
      removeGeneratedAsset(id);
    });
    setShowMultiDeleteModal(false);
    setIsSelectionMode(false);
    setSelectedIds(new Set());
  };'''

new_delete = '''const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return;
    setIsDeleting(true);
    await new Promise(r => setTimeout(r, 600)); // Simulate loading
    selectedIds.forEach(id => {
      removeGeneratedAsset(id);
    });
    setIsDeleting(false);
    setShowMultiDeleteModal(false);
    setIsSelectionMode(false);
    setSelectedIds(new Set());
  };'''
gal_content = gal_content.replace(old_delete, new_delete)

# Single delete loading
old_single_delete = '''<button 
                onClick={() => {
                  removeGeneratedAsset(imageToDelete.id || imageToDelete.url);
                  setImageToDelete(null);
                }}'''

new_single_delete = '''<button 
                onClick={async () => {
                  setIsDeleting(true);
                  await new Promise(r => setTimeout(r, 500));
                  removeGeneratedAsset(imageToDelete.id || imageToDelete.url);
                  setIsDeleting(false);
                  setImageToDelete(null);
                }}'''
gal_content = gal_content.replace(old_single_delete, new_single_delete)

# Add Loading overlay for delete
loading_overlay = '''
      {isDeleting && (
        <div className="fixed inset-0 z-[1000] flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-12 h-12 border-4 border-[#a855f7] border-t-transparent rounded-full animate-spin mb-4"></div>
          <div className="text-white font-semibold tracking-widest uppercase text-sm">Deleting...</div>
        </div>
      )}
'''
if "Deleting..." not in gal_content:
    gal_content = gal_content.replace('</ImageViewerModal>', '</ImageViewerModal>\n' + loading_overlay)

# Fix filter tab Limbo
gal_content = gal_content.replace('sticky top-4 z-10', 'relative mb-4 z-10')

with open(gal_path, 'w', encoding='utf-8') as f:
    f.write(gal_content)

print("Applied UI fixes safely!")

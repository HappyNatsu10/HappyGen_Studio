import os

# 1. Fix ImageViewerModal.jsx (Rules of Hooks violation)
viewer_path = 'src/components/common/ImageViewerModal.jsx'
with open(viewer_path, 'r', encoding='utf-8') as f:
    content = f.read()

bad_hook = '''  const hasMultiple = images && images.length > 1;

  const batchInfo = React.useMemo(() => {
    if (!currentImage || !images || images.length === 0) return null;
    if (!currentImage.timestamp) return null;
    const batch = images.filter(img => Math.abs((img.timestamp || 0) - currentImage.timestamp) < 2000);
    if (batch.length <= 1) return null;
    batch.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
    const idx = batch.findIndex(img => img.id === currentImage.id) + 1;
    return { index: idx, total: batch.length };
  }, [currentImage, images]);

  const handlePrev = (e) => {'''

if bad_hook in content:
    content = content.replace(bad_hook, '  const hasMultiple = images && images.length > 1;\n\n  const handlePrev = (e) => {')
    
    # We will inject the hook right BEFORE `if (!isOpen || !currentImage) return null;`
    early_return = '  if (!isOpen || !currentImage) return null;'
    good_hook = '''  const batchInfo = React.useMemo(() => {
    if (!currentImage || !images || images.length === 0) return null;
    if (!currentImage.timestamp) return null;
    const batch = images.filter(img => Math.abs((img.timestamp || 0) - currentImage.timestamp) < 2000);
    if (batch.length <= 1) return null;
    batch.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
    const idx = batch.findIndex(img => img.id === currentImage.id) + 1;
    return { index: idx, total: batch.length };
  }, [currentImage, images]);

  if (!isOpen || !currentImage) return null;'''
    content = content.replace(early_return, good_hook)
    
    with open(viewer_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Fixed ImageViewerModal hook violation.")


# 2. Fix ModelExplorer.jsx Filter Limbo
explorer_path = 'src/components/models/ModelExplorer.jsx'
with open(explorer_path, 'r', encoding='utf-8') as f:
    exp_content = f.read()

scroll_logic = '''  const handleScroll = useCallback((e) => {
    const currentScrollY = e.target.scrollTop;
    if (currentScrollY > lastScrollY.current + 15 && currentScrollY > 100) {
      setShowFilters(false);
    } else if (currentScrollY < lastScrollY.current - 15 || currentScrollY <= 10) {
      setShowFilters(true);
    }
    lastScrollY.current = currentScrollY;
  }, []);'''

safe_scroll_logic = '''  const handleScroll = useCallback((e) => {
    // Disabled auto-hide to prevent layout shifting limbo on short pages
    const currentScrollY = e.target.scrollTop;
    lastScrollY.current = currentScrollY;
  }, []);'''

if scroll_logic in exp_content:
    exp_content = exp_content.replace(scroll_logic, safe_scroll_logic)
    with open(explorer_path, 'w', encoding='utf-8') as f:
        f.write(exp_content)
    print("Fixed ModelExplorer scroll limbo.")


import os

path = 'src/components/BackendConfigModal.jsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

old_block = '''                  <div className="mt-2">
                    <a 
                      href="https://colab.research.google.com/github/HappyNatsu10/HappyGen_Studio/blob/main/colab_server.ipynb"
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn btn-secondary w-full text-[12px] flex items-center justify-center gap-2 border border-[#a855f7]"
                    >
                      <Globe className="w-3.5 h-3.5 text-[#a855f7]" /> 
                      <span className="text-[#a855f7]">{t('backendModal.openColab', 'Open Google Colab Notebook (Free GPU)')}</span>
                    </a>
                  </div>'''

new_block = '''                  <div className="mt-2 flex flex-col gap-2">
                    <a 
                      href="https://colab.research.google.com/github/HappyNatsu10/HappyGen_Studio/blob/main/colab_server.ipynb"
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn btn-secondary w-full text-[12px] flex items-center justify-center gap-2 border border-[#a855f7]"
                    >
                      <Globe className="w-3.5 h-3.5 text-[#a855f7]" /> 
                      <span className="text-[#a855f7]">{t('backendModal.openColab', 'Open Google Colab Notebook (Free GPU)')}</span>
                    </a>
                    <a 
                      href="https://kaggle.com/kernels/welcome?src=https://github.com/HappyNatsu10/HappyGen_Studio/blob/main/kaggle_server.ipynb"
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn btn-secondary w-full text-[12px] flex items-center justify-center gap-2 border border-[#00a6f4]"
                    >
                      <Globe className="w-3.5 h-3.5 text-[#00a6f4]" /> 
                      <span className="text-[#00a6f4]">{t('backendModal.openKaggle', 'Open Kaggle Notebook (Free GPU)')}</span>
                    </a>
                  </div>'''

if old_block in content:
    content = content.replace(old_block, new_block)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Added Kaggle button to BackendConfigModal")
else:
    print("Could not find the target block in BackendConfigModal.jsx")

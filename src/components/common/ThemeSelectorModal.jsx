import React, { useState } from 'react';
import { X, Palette, Plus, Edit2, Trash2, ChevronLeft, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import useThemeStore, { PRESET_THEMES } from '../../store/useThemeStore';

const THEME_KEYS = [
  { key: '--surface-0', label: 'Background (Base)' },
  { key: '--surface-1', label: 'Background (Elevated)' },
  { key: '--surface-2', label: 'Background (Cards/Hover)' },
  { key: '--border-subtle', label: 'Border (Subtle)' },
  { key: '--border-default', label: 'Border (Default)' },
  { key: '--accent', label: 'Accent Color (Primary)' },
  { key: '--text-primary', label: 'Text (Primary)' },
  { key: '--text-secondary', label: 'Text (Secondary)' },
  { key: '--text-tertiary', label: 'Text (Tertiary)' },
];

export default function ThemeSelectorModal({ isOpen, onClose }) {
  const { t } = useTranslation();
  const { activeThemeId, customThemes, setTheme, addCustomTheme, updateCustomTheme, deleteCustomTheme } = useThemeStore();
  
  const [view, setView] = useState('list'); // 'list' or 'edit'
  const [editingThemeId, setEditingThemeId] = useState(null);
  const [editData, setEditData] = useState({ name: '', colors: {} });

  if (!isOpen) return null;

  const handleCreateNew = () => {
    setEditData({
      name: 'My Custom Theme',
      colors: { ...PRESET_THEMES.default.colors }
    });
    setEditingThemeId(null);
    setView('edit');
  };

  const handleEdit = (theme) => {
    setEditData({
      name: theme.name,
      colors: { ...theme.colors }
    });
    setEditingThemeId(theme.id);
    setView('edit');
  };

  const handleSave = () => {
    if (editingThemeId) {
      updateCustomTheme(editingThemeId, editData);
      setTheme(editingThemeId);
    } else {
      addCustomTheme(editData);
    }
    setView('list');
  };

  const allPresets = Object.values(PRESET_THEMES);

  return (
    <div className="modal-overlay overlay-enter" onClick={onClose} style={{ zIndex: 100 }}>
      <div className="modal-panel flex flex-col p-5" style={{ maxWidth: 500, minHeight: 500 }} onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {view === 'edit' ? (
              <button onClick={() => setView('list')} className="p-1 hover:bg-[var(--surface-2)] rounded-md transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                <ChevronLeft className="w-5 h-5" />
              </button>
            ) : (
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/20">
                <Palette className="w-4 h-4 text-purple-400" />
              </div>
            )}
            <h2 className="text-xl font-bold text-[var(--text-primary)]">
              {view === 'list' 
                ? t('theme.appearanceThemes', 'Appearance Themes') 
                : (editingThemeId ? t('theme.editTheme', 'Edit Theme') : t('theme.createCustomTheme', 'Create Custom Theme'))}
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-[var(--surface-2)] text-[var(--text-secondary)] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-1 -mr-1 custom-scrollbar">
          {view === 'list' ? (
            <div className="space-y-6">
              {/* Presets */}
              <div>
                <h3 className="text-[12px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider mb-3">{t('theme.presetThemes', 'Preset Themes')}</h3>
                <div className="grid grid-cols-2 gap-3">
                  {allPresets.map(theme => (
                    <button
                      key={theme.id}
                      onClick={() => setTheme(theme.id)}
                      className="flex items-center gap-3 p-3 rounded-xl border text-left transition-all relative overflow-hidden group"
                      style={{
                        backgroundColor: 'var(--surface-0)',
                        borderColor: activeThemeId === theme.id ? 'var(--accent)' : 'var(--border-subtle)',
                      }}
                    >
                      {activeThemeId === theme.id && (
                        <div className="absolute top-2 right-2 text-[var(--accent)]">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                      <div className="w-8 h-8 rounded-full border border-[var(--border-subtle)] shrink-0"
                           style={{ backgroundColor: theme.colors['--surface-1'] }}>
                        <div className="w-3 h-3 rounded-full absolute bottom-3 right-[calc(100%-42px)] border border-[var(--surface-0)]"
                             style={{ backgroundColor: theme.colors['--accent'] }} />
                      </div>
                      <span className="text-[13px] font-medium text-[var(--text-primary)] truncate pr-4">{theme.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Themes */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-[12px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider">{t('theme.yourThemes', 'Your Themes')}</h3>
                  <button onClick={handleCreateNew} className="text-[12px] text-[var(--accent)] hover:underline flex items-center gap-1 font-medium">
                    <Plus className="w-3.5 h-3.5" /> {t('theme.newTheme', 'New Theme')}
                  </button>
                </div>
                
                {customThemes.length === 0 ? (
                  <div className="text-center p-6 border border-dashed rounded-xl" style={{ borderColor: 'var(--border-subtle)' }}>
                    <p className="text-[13px] text-[var(--text-secondary)]">{t('theme.noCustomThemes', "You haven't created any custom themes yet.")}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {customThemes.map(theme => (
                      <div key={theme.id} className="flex items-center gap-2">
                        <button
                          onClick={() => setTheme(theme.id)}
                          className="flex-1 flex items-center gap-3 p-3 rounded-xl border text-left transition-all relative"
                          style={{
                            backgroundColor: 'var(--surface-0)',
                            borderColor: activeThemeId === theme.id ? 'var(--accent)' : 'var(--border-subtle)',
                          }}
                        >
                          <div className="w-6 h-6 rounded-full border border-[var(--border-subtle)] shrink-0"
                               style={{ backgroundColor: theme.colors['--surface-1'] }}>
                            <div className="w-2 h-2 rounded-full absolute bottom-4 right-[calc(100%-40px)] border border-[var(--surface-0)]"
                                 style={{ backgroundColor: theme.colors['--accent'] }} />
                          </div>
                          <span className="text-[13px] font-medium text-[var(--text-primary)] truncate">{theme.name}</span>
                          {activeThemeId === theme.id && <Check className="w-4 h-4 text-[var(--accent)] absolute right-3" />}
                        </button>
                        <button onClick={() => handleEdit(theme)} className="p-3 rounded-xl border hover:bg-[var(--surface-2)] transition-colors text-[var(--text-secondary)]" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-0)' }}>
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => deleteCustomTheme(theme.id)} className="p-3 rounded-xl border hover:bg-red-500/10 hover:border-red-500/30 transition-colors text-red-400" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-0)' }}>
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4 pb-4 animate-fade-in">
              <div>
                <label className="text-[11px] font-medium block mb-1.5" style={{ color: 'var(--text-tertiary)' }}>{t('theme.themeName', 'Theme Name')}</label>
                <input 
                  type="text" 
                  value={editData.name} 
                  onChange={e => setEditData({...editData, name: e.target.value})}
                  className="input w-full text-[13px]" 
                  placeholder={t('theme.namePlaceholder', 'E.g. Neon Nights')}
                />
              </div>

              <div className="space-y-3 mt-6">
                <label className="text-[11px] font-medium block" style={{ color: 'var(--text-tertiary)' }}>{t('theme.colorPalette', 'Color Palette')}</label>
                <div className="grid grid-cols-1 gap-3">
                  {THEME_KEYS.map(({ key, label }) => {
                    const val = editData.colors[key] || '#000000';
                    // We need to parse rgba to hex if it's rgba, but native color picker only supports hex.
                    // To keep it simple, we'll use text input for full flexibility (rgba) + color block.
                    // Or native color picker + opacity. Let's stick to text inputs for borders to support rgba,
                    // but for simplicity, allow users to type valid CSS colors.
                    
                    const isRgba = val.startsWith('rgba');
                    
                    return (
                      <div key={key} className="flex items-center gap-3 p-2.5 rounded-lg border" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}>
                        <div className="w-8 h-8 rounded shrink-0 border border-white/20 overflow-hidden relative" style={{ backgroundColor: val }}>
                           {!isRgba && (
                             <input 
                               type="color" 
                               value={val}
                               onChange={(e) => {
                                 setEditData({
                                   ...editData,
                                   colors: { ...editData.colors, [key]: e.target.value }
                                 });
                               }}
                               className="absolute inset-0 w-[200%] h-[200%] -top-2 -left-2 cursor-pointer opacity-0"
                             />
                           )}
                        </div>
                        <div className="flex-1">
                          <div className="text-[12px] font-medium text-[var(--text-primary)]">{label}</div>
                          <div className="text-[10px] text-[var(--text-tertiary)] font-mono">{key}</div>
                        </div>
                        <input 
                          type="text" 
                          value={val}
                          onChange={(e) => {
                            setEditData({
                              ...editData,
                              colors: { ...editData.colors, [key]: e.target.value }
                            });
                          }}
                          className="input w-32 text-[12px] py-1.5 px-2 text-center font-mono"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 mt-2 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                <button onClick={handleSave} className="btn btn-primary w-full text-[13px] py-2.5">
                  {editingThemeId ? t('theme.saveChanges', 'Save Changes') : t('theme.createTheme', 'Create Theme')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

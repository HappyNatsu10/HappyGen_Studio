import React from 'react';
import useAppStore from '../../store/useAppStore';
import { useAuth } from '../../context/AuthContext';
import { Image, Layers, FolderOpen, Settings, ChevronLeft, ChevronRight, Zap, Video, Brush } from 'lucide-react';

const NAV_GROUPS = [
  { 
    label: 'CREATE', 
    items: [
      { id: 'generate', label: 'Image', icon: Image },
      { id: 'video', label: 'Video', icon: Video },
      { id: 'inpaint', label: 'Inpaint', icon: Brush }
    ] 
  },
  { 
    label: 'DISCOVER', 
    items: [
      { id: 'models', label: 'Models & LoRAs', icon: Layers }
    ] 
  },
  { 
    label: 'LIBRARY', 
    items: [
      { id: 'gallery', label: 'Gallery', icon: FolderOpen }
    ] 
  },
  { 
    label: 'SYSTEM', 
    items: [
      { id: 'settings', label: 'Settings', icon: Settings }
    ] 
  }
];

export default function Sidebar() {
  const {
    activeTab,
    setActiveTab,
    sidebarCollapsed: collapsed,
    toggleSidebar: onToggleCollapse,
    setShowProfileModal
  } = useAppStore();

  const { currentUser, isAuthenticated, openAuth: onOpenAuth } = useAuth();
  const onOpenProfile = () => setShowProfileModal(true);
  return (
    <aside
      className={`fixed left-0 top-0 bottom-0 z-30 flex flex-col border-r transition-all duration-200 hidden md:flex ${
        collapsed ? 'w-[60px]' : 'w-[220px]'
      }`}
      style={{
        backgroundColor: 'var(--surface-1)',
        borderColor: 'var(--border-subtle)',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 h-14 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
             style={{ background: 'linear-gradient(135deg, var(--accent) 0%, #a855f7 100%)' }}>
          O
        </div>
        {!collapsed && (
          <span className="font-semibold text-sm tracking-tight" style={{ color: 'var(--text-primary)' }}>
            HappyGen <span style={{ color: 'var(--text-tertiary)', fontWeight: 400 }}>v2</span>
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-4 overflow-y-auto">
        {NAV_GROUPS.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            {!collapsed && (
              <div className="px-3 text-[10px] font-bold tracking-wider mb-1" style={{ color: 'var(--text-tertiary)' }}>
                {group.label}
              </div>
            )}
            {group.items.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all cursor-pointer ${
                    collapsed ? 'justify-center' : ''
                  }`}
                  style={{
                    background: isActive ? 'var(--accent-subtle)' : 'transparent',
                    color: isActive ? 'var(--text-accent)' : 'var(--text-secondary)',
                  }}
                  title={collapsed ? item.label : undefined}
                >
                  {/* Gradient active indicator */}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-3/4 rounded-r-md"
                         style={{ background: 'linear-gradient(to bottom, var(--accent), #a855f7)' }} />
                  )}
                  
                  <Icon className="w-[18px] h-[18px] flex-shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Bottom: User + Collapse */}
      <div className="px-2 pb-3 pt-2 space-y-2 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
        {/* User */}
        {isAuthenticated && currentUser ? (
          <button
            onClick={onOpenProfile}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all cursor-pointer hover:bg-[var(--surface-2)] ${
              collapsed ? 'justify-center' : ''
            }`}
            style={{ color: 'var(--text-secondary)' }}
          >
            <img
              src={currentUser.avatar}
              alt=""
              className="w-7 h-7 rounded-full object-cover flex-shrink-0"
              style={{ border: '1px solid var(--border-default)' }}
            />
            {!collapsed && (
              <div className="text-left overflow-hidden">
                <div className="text-[12px] font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                  {currentUser.name}
                </div>
                <div className="text-[10px] font-mono" style={{ color: 'var(--text-tertiary)' }}>
                  {currentUser.credits ?? 150} credits
                </div>
              </div>
            )}
          </button>
        ) : (
          <button
            onClick={() => onOpenAuth('login')}
            className={`w-full btn btn-secondary text-xs ${collapsed ? 'px-2' : ''}`}
          >
            {collapsed ? '→' : 'Sign In'}
          </button>
        )}

        {/* Collapse Toggle */}
        <button
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-center py-1.5 rounded-md cursor-pointer transition-all hover:bg-[var(--surface-2)]"
          style={{ color: 'var(--text-tertiary)' }}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
}

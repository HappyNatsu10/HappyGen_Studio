import React from 'react';
import { useTranslation } from 'react-i18next';
import useAppStore from '../../store/useAppStore';
import { useAuth } from '../../context/AuthContext';
import { Image, Layers, FolderOpen, Settings, ChevronLeft, ChevronRight, Zap, Video, Brush } from 'lucide-react';

const DiscordIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
  </svg>
);

const XIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

export default function Sidebar() {
  const { t } = useTranslation();
  
  const NAV_GROUPS = [
    { 
      label: t('sidebar.create', 'CREATE'), 
      items: [
        { id: 'generate', label: t('sidebar.generate', 'Image'), icon: Image },
        { id: 'video', label: t('sidebar.video', 'Video'), icon: Video },
        { id: 'inpaint', label: t('sidebar.inpaint', 'Inpaint'), icon: Brush }
      ] 
    },
    { 
      label: t('sidebar.discover', 'DISCOVER'), 
      items: [
        { id: 'models', label: t('sidebar.modelExplorer', 'Models & LoRAs'), icon: Layers }
      ] 
    },
    { 
      label: t('sidebar.library', 'LIBRARY'), 
      items: [
        { id: 'gallery', label: t('sidebar.gallery', 'Gallery'), icon: FolderOpen }
      ] 
    },
    { 
      label: t('sidebar.system', 'SYSTEM'), 
      items: [
        { id: 'settings', label: t('sidebar.settings', 'Settings'), icon: Settings }
      ] 
    },
    { 
      label: t('sidebar.community', 'COMMUNITY'), 
      items: [
        { id: 'discord', label: 'Discord', isExternal: true, url: 'https://discord.gg/TNb3XcFaM', icon: DiscordIcon },
        { id: 'x', label: 'X (Twitter)', isExternal: true, url: 'https://x.com/happygenstudio', icon: XIcon }
      ] 
    }
  ];

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
        <img
          src="/logo.png"
          alt="HappyGen Logo"
          className="w-8 h-8 object-contain"
        />
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
              
              if (item.isExternal) {
                return (
                  <a
                    key={item.id}
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className={`relative w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all hover:bg-[var(--surface-2)] ${
                      collapsed ? 'justify-center' : ''
                    }`}
                    style={{
                      background: 'transparent',
                      color: 'var(--text-secondary)',
                    }}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon className="w-[18px] h-[18px] flex-shrink-0" />
                    {!collapsed && <span>{item.label}</span>}
                  </a>
                );
              }

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all cursor-pointer ${
                    collapsed ? 'justify-center' : ''
                  } ${item.id === 'gallery' ? 'tour-gallery-desktop' : ''}`}
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
            {!collapsed && <div className="flex-1 overflow-hidden">
                  <div className="text-[13px] font-semibold text-[var(--text-primary)] truncate">
                    {currentUser.name}
                  </div>
                  <div className="text-[11px] text-[var(--text-tertiary)] truncate mt-0.5">
                    {currentUser.tier === 'Pro Studio Creator' 
                      ? t('sidebar.proUser', 'Pro Studio Creator') 
                      : (currentUser.tier === 'Free User' 
                          ? t('sidebar.freeUser', 'Free User') 
                          : (currentUser.tier || t('sidebar.freeUser', 'Free User')))}
                  </div>
                </div>
            }
          </button>
        ) : (
          <button
            onClick={() => onOpenAuth('login')}
            className={`w-full btn btn-secondary text-xs ${collapsed ? 'px-2' : ''}`}
          >
            {collapsed ? '→' : t('topBar.signIn', 'Sign In')}
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

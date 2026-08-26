import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, LogOut, Image as ImageIcon, PlusCircle, Check, Edit3 } from 'lucide-react';

export default function UserProfileModal({ isOpen, onClose }) {
  const { currentUser, logout, updateProfile, addCredits, DEFAULT_AVATARS } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(currentUser?.name || '');
  const [selectedAvatar, setSelectedAvatar] = useState(currentUser?.avatar || DEFAULT_AVATARS[0]);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen || !currentUser) return null;

  const handleSave = (e) => {
    e.preventDefault();
    updateProfile({ name: name.trim() || currentUser.name, avatar: selectedAvatar });
    setIsEditing(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleLogout = () => {
    logout();
    onClose();
  };

  const stats = [
    { label: 'Credits', value: currentUser.credits ?? 150 },
    { label: 'Generated', value: currentUser.generationCount ?? 0 },
    { label: 'Joined', value: currentUser.createdAt
      ? new Date(currentUser.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      : 'Today' },
  ];

  return (
    <div className="modal-overlay overlay-enter" onClick={onClose}>
      <div className="modal-panel" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
        <div className="p-6 space-y-5">

          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <img
                src={currentUser.avatar || DEFAULT_AVATARS[0]}
                alt={currentUser.name}
                className="w-14 h-14 rounded-xl object-cover"
                style={{ border: '2px solid var(--border-default)' }}
              />
              <div>
                <h2 className="text-[15px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {currentUser.name}
                </h2>
                <p className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                  {currentUser.email || 'Guest User'}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="btn-ghost p-1.5 rounded-md cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2">
            {stats.map(s => (
              <div key={s.label} className="card text-center py-3 px-2">
                <div className="text-[16px] font-semibold" style={{ color: 'var(--text-primary)' }}>{s.value}</div>
                <div className="text-[10px] font-medium" style={{ color: 'var(--text-tertiary)' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Daily Bonus */}
          <button
            onClick={() => addCredits(50)}
            className="btn btn-secondary w-full text-[12px]"
          >
            <PlusCircle className="w-4 h-4" style={{ color: 'var(--success)' }} />
            Claim Daily Bonus (+50 credits)
          </button>

          {/* Edit Profile */}
          {isEditing ? (
            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="text-[11px] font-medium block mb-1" style={{ color: 'var(--text-tertiary)' }}>Display Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)}
                  className="input w-full text-[13px]" />
              </div>
              <div>
                <label className="text-[11px] font-medium block mb-1.5" style={{ color: 'var(--text-tertiary)' }}>Avatar</label>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {DEFAULT_AVATARS.map((url, idx) => (
                    <button key={idx} type="button" onClick={() => setSelectedAvatar(url)}
                      className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 cursor-pointer transition-all"
                      style={{
                        border: selectedAvatar === url ? '2px solid var(--accent)' : '2px solid transparent',
                        opacity: selectedAvatar === url ? 1 : 0.5,
                      }}>
                      <img src={url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="btn btn-primary flex-1 text-[12px]">
                  <Check className="w-3.5 h-3.5" /> Save
                </button>
                <button type="button" onClick={() => setIsEditing(false)} className="btn btn-secondary text-[12px]">
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button onClick={() => { setIsEditing(true); setName(currentUser.name); setSelectedAvatar(currentUser.avatar); }}
              className="btn btn-ghost w-full text-[12px]">
              <Edit3 className="w-3.5 h-3.5" /> Edit Profile
            </button>
          )}

          {savedSuccess && (
            <div className="flex items-center gap-2 p-2.5 rounded-lg text-[12px]"
              style={{ background: 'rgba(52,211,153,0.08)', color: 'var(--success)' }}>
              <Check className="w-3.5 h-3.5" /> Profile updated!
            </div>
          )}

          {/* Logout */}
          <div className="pt-2 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
            <button onClick={handleLogout} className="btn btn-danger w-full text-[12px]">
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

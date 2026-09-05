import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, LogOut, PlusCircle, Check, Edit3, User, Shield, AlertTriangle } from 'lucide-react';

export default function UserProfileModal({ isOpen, onClose }) {
  const { currentUser, logout, updateProfile, changePassword, deleteAccount, DEFAULT_AVATARS } = useAuth();
  
  const [activeTab, setActiveTab] = useState('profile'); // profile, security, danger

  // Profile State
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(currentUser?.name || '');
  const [selectedAvatar, setSelectedAvatar] = useState(currentUser?.avatar || DEFAULT_AVATARS[0]);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Security State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [securityError, setSecurityError] = useState('');
  const [securitySuccess, setSecuritySuccess] = useState(false);

  // Danger State
  const [deleteConfirmPassword, setDeleteConfirmPassword] = useState('');
  const [deleteError, setDeleteError] = useState('');

  if (!isOpen || !currentUser) return null;

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateProfile({ name: name.trim() || currentUser.name, avatar: selectedAvatar });
    setIsEditing(false);
    setProfileSuccess(true);
    setTimeout(() => setProfileSuccess(false), 2000);
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    setSecurityError('');
    setSecuritySuccess(false);
    
    if (newPassword.length < 6) {
      setSecurityError('New password must be at least 6 characters.');
      return;
    }
    
    try {
      changePassword(currentPassword, newPassword);
      setSecuritySuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setTimeout(() => setSecuritySuccess(false), 3000);
    } catch (err) {
      setSecurityError(err.message);
    }
  };

  const handleDeleteAccount = (e) => {
    e.preventDefault();
    setDeleteError('');
    try {
      deleteAccount(deleteConfirmPassword);
      onClose();
    } catch (err) {
      setDeleteError(err.message);
    }
  };

  const handleLogout = () => {
    logout();
    onClose();
  };

  const stats = [
    { label: 'Generated', value: currentUser.generatedCount ?? 0 },
    { label: 'Joined', value: currentUser.createdAt
      ? new Date(currentUser.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      : 'Today' },
  ];

  return (
    <div className="modal-overlay overlay-enter" onClick={onClose}>
      <div className="modal-panel flex flex-col md:flex-row" style={{ maxWidth: 650, minHeight: 450, padding: 0 }} onClick={e => e.stopPropagation()}>
        
        {/* Left Sidebar */}
        <div className="w-full md:w-[200px] border-b md:border-b-0 md:border-r border-[var(--border-subtle)] bg-[var(--surface-1)] flex flex-col p-4 rounded-l-2xl">
          
          <div className="flex items-center gap-3 mb-6">
            <img
              src={currentUser.avatar || DEFAULT_AVATARS[0]}
              alt={currentUser.name}
              className="w-10 h-10 rounded-full object-cover border border-[var(--border-default)]"
            />
            <div className="overflow-hidden">
              <h2 className="text-[14px] font-bold truncate" style={{ color: 'var(--text-primary)' }}>
                {currentUser.name}
              </h2>
              <div className="text-[10px] text-[var(--accent)] font-medium uppercase tracking-wider">{currentUser.tier || 'User'}</div>
            </div>
          </div>

          <nav className="flex-1 space-y-1">
            <button 
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-2 px-3 py-2 text-[12px] rounded-lg transition-colors ${activeTab === 'profile' ? 'bg-[var(--surface-3)] text-white font-medium' : 'text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-white'}`}
            >
              <User className="w-4 h-4" /> Profile Details
            </button>
            <button 
              onClick={() => setActiveTab('security')}
              className={`w-full flex items-center gap-2 px-3 py-2 text-[12px] rounded-lg transition-colors ${activeTab === 'security' ? 'bg-[var(--surface-3)] text-white font-medium' : 'text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-white'}`}
            >
              <Shield className="w-4 h-4" /> Security
            </button>
            <button 
              onClick={() => setActiveTab('danger')}
              className={`w-full flex items-center gap-2 px-3 py-2 text-[12px] rounded-lg transition-colors ${activeTab === 'danger' ? 'bg-red-500/10 text-red-400 font-medium' : 'text-[var(--text-secondary)] hover:bg-red-500/10 hover:text-red-400'}`}
            >
              <AlertTriangle className="w-4 h-4" /> Danger Zone
            </button>
          </nav>

          <div className="mt-4 pt-4 border-t border-[var(--border-subtle)]">
            <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-[var(--text-secondary)] hover:text-white hover:bg-[var(--surface-2)] rounded-lg transition-colors">
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>

        {/* Right Content */}
        <div className="flex-1 flex flex-col relative">
          <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-[var(--surface-2)] text-[var(--text-secondary)] transition-colors z-10">
            <X className="w-4 h-4" />
          </button>

          <div className="p-6 md:p-8 flex-1 overflow-y-auto">
            {activeTab === 'profile' && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h3 className="text-[16px] font-semibold text-white">Account Overview</h3>
                  <p className="text-[12px] text-[var(--text-tertiary)]">Manage your display profile.</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {stats.map(s => (
                    <div key={s.label} className="card text-center py-3 px-2 border border-[var(--border-subtle)]">
                      <div className="text-[16px] font-semibold" style={{ color: 'var(--text-primary)' }}>{s.value}</div>
                      <div className="text-[10px] font-medium uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                <div className="pt-6 border-t border-[var(--border-subtle)]">
                  <h4 className="text-[13px] font-medium text-white mb-4">Edit Profile</h4>
                  {isEditing ? (
                    <form onSubmit={handleSaveProfile} className="space-y-4">
                      <div>
                        <label className="text-[11px] font-medium block mb-1.5" style={{ color: 'var(--text-tertiary)' }}>Display Name</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)}
                          className="input w-full text-[13px]" />
                      </div>
                      <div>
                        <label className="text-[11px] font-medium block mb-1.5" style={{ color: 'var(--text-tertiary)' }}>Avatar</label>
                        <div className="flex items-center gap-2 overflow-x-auto pb-2">
                          {DEFAULT_AVATARS.map((url, idx) => (
                            <button key={idx} type="button" onClick={() => setSelectedAvatar(url)}
                              className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 cursor-pointer transition-all"
                              style={{
                                border: selectedAvatar === url ? '2px solid var(--accent)' : '2px solid transparent',
                                opacity: selectedAvatar === url ? 1 : 0.4,
                              }}>
                              <img src={url} alt="" className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button type="submit" className="btn btn-primary px-5 text-[12px]">
                          Save Changes
                        </button>
                        <button type="button" onClick={() => setIsEditing(false)} className="btn btn-secondary text-[12px]">
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <button onClick={() => { setIsEditing(true); setName(currentUser.name); setSelectedAvatar(currentUser.avatar); }}
                      className="btn btn-secondary w-full text-[12px] bg-[var(--surface-2)]">
                      <Edit3 className="w-3.5 h-3.5" /> Edit Display Name & Avatar
                    </button>
                  )}
                  {profileSuccess && (
                    <div className="mt-3 flex items-center gap-2 p-2.5 rounded-lg text-[12px] text-green-400 bg-green-500/10">
                      <Check className="w-3.5 h-3.5" /> Profile updated successfully!
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h3 className="text-[16px] font-semibold text-white">Security Settings</h3>
                  <p className="text-[12px] text-[var(--text-tertiary)]">Update your password to keep your account secure.</p>
                </div>

                {currentUser.isGuest ? (
                  <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[13px]">
                    Guest accounts cannot change passwords. Please create a full account to use this feature.
                  </div>
                ) : (
                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div>
                      <label className="text-[12px] font-medium block mb-1.5 text-[var(--text-secondary)]">Current Password</label>
                      <input 
                        type="password" 
                        value={currentPassword} 
                        onChange={e => setCurrentPassword(e.target.value)}
                        className="input w-full text-[13px]" 
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[12px] font-medium block mb-1.5 text-[var(--text-secondary)]">New Password</label>
                      <input 
                        type="password" 
                        value={newPassword} 
                        onChange={e => setNewPassword(e.target.value)}
                        className="input w-full text-[13px]" 
                        required
                        minLength={6}
                      />
                    </div>
                    
                    {securityError && <p className="text-[12px] text-red-400 mt-1">{securityError}</p>}
                    {securitySuccess && <p className="text-[12px] text-green-400 mt-1 flex items-center gap-1"><Check className="w-3.5 h-3.5"/> Password updated successfully</p>}
                    
                    <button type="submit" className="btn btn-primary w-full text-[13px] mt-2">
                      Update Password
                    </button>
                  </form>
                )}
              </div>
            )}

            {activeTab === 'danger' && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h3 className="text-[16px] font-semibold text-red-400">Danger Zone</h3>
                  <p className="text-[12px] text-[var(--text-tertiary)]">Irreversible actions for your account.</p>
                </div>

                {currentUser.isGuest ? (
                  <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border-subtle)] text-[var(--text-secondary)] text-[13px]">
                    Guest accounts are automatically wiped when you close the browser. No manual deletion needed.
                  </div>
                ) : (
                  <div className="p-5 rounded-xl bg-red-500/5 border border-red-500/20">
                    <h4 className="text-[14px] font-semibold text-red-400 mb-2">Delete Account</h4>
                    <p className="text-[12px] text-red-400/80 mb-4 leading-relaxed">
                      Once you delete your account, there is no going back. All of your saved prompts and library items will be permanently erased from this device.
                    </p>
                    
                    <form onSubmit={handleDeleteAccount} className="space-y-3">
                      <div>
                        <label className="text-[12px] font-medium block mb-1.5 text-red-400/90">Confirm Password</label>
                        <input 
                          type="password" 
                          value={deleteConfirmPassword} 
                          onChange={e => setDeleteConfirmPassword(e.target.value)}
                          className="input w-full text-[13px] bg-red-500/10 border-red-500/30 focus:border-red-500/60" 
                          required
                          placeholder="Enter password to confirm"
                        />
                      </div>
                      
                      {deleteError && <p className="text-[12px] text-red-400 font-medium">{deleteError}</p>}
                      
                      <button 
                        type="submit" 
                        disabled={!deleteConfirmPassword}
                        className="btn w-full bg-red-500 hover:bg-red-600 text-white font-semibold disabled:opacity-50 text-[13px] border-none"
                      >
                        Permanently Delete Account
                      </button>
                    </form>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

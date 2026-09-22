import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { X, LogOut, PlusCircle, Check, Edit3, User, Shield, AlertTriangle, Upload, MessageSquare } from 'lucide-react';
import { resizeAndConvertToBase64 } from '../utils/imageUtils';

export default function UserProfileModal({ isOpen, onClose }) {
  const { t } = useTranslation();
  const { currentUser, logout, updateProfile, changePassword, deleteAccount, DEFAULT_AVATARS } = useAuth();
  
  const [activeTab, setActiveTab] = useState('profile'); // profile, security, danger

  // Profile State
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(currentUser?.name || '');
  const [selectedAvatar, setSelectedAvatar] = useState(currentUser?.avatar || DEFAULT_AVATARS[0]);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

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

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setLoading(true);
      const base64Img = await resizeAndConvertToBase64(file);
      setSelectedAvatar(base64Img);
    } catch (err) {
      console.error(err);
      // Optional: set a specific profile error if needed
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    setSecurityError('');
    setSecuritySuccess(false);
    
    if (newPassword.length < 6) {
      setSecurityError(t('profile.passwordLengthError', 'New password must be at least 6 characters.'));
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
    { label: t('profile.generated', 'Generated'), value: currentUser.generatedCount ?? 0 },
    { label: t('profile.joined', 'Joined'), value: currentUser.createdAt
      ? new Date(currentUser.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      : (currentUser.creationTime ? new Date(currentUser.creationTime).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : t('profile.today', 'Today')) },
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
              <div className="text-[10px] text-[var(--accent)] font-medium uppercase tracking-wider">{currentUser.tier || t('profile.userTier', 'User')}</div>
            </div>
          </div>

          <nav className="flex-1 space-y-1">
            <button 
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-2 px-3 py-2 text-[12px] rounded-lg transition-colors ${activeTab === 'profile' ? 'bg-[var(--surface-3)] text-[var(--text-primary)] font-medium' : 'text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)]'}`}
            >
              <User className="w-4 h-4" /> {t('profile.profileDetails', 'Profile Details')}
            </button>
            <button 
              onClick={() => setActiveTab('security')}
              className={`w-full flex items-center gap-2 px-3 py-2 text-[12px] rounded-lg transition-colors ${activeTab === 'security' ? 'bg-[var(--surface-3)] text-[var(--text-primary)] font-medium' : 'text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)]'}`}
            >
              <Shield className="w-4 h-4" /> {t('profile.security', 'Security')}
            </button>
            <button 
              onClick={() => setActiveTab('feedback')}
              className={`w-full flex items-center gap-2 px-3 py-2 text-[12px] rounded-lg transition-colors ${activeTab === 'feedback' ? 'bg-[var(--surface-3)] text-[var(--text-primary)] font-medium' : 'text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)]'}`}
            >
              <MessageSquare className="w-4 h-4" /> {t('profile.feedback', 'Feedback')}
            </button>
            <button 
              onClick={() => setActiveTab('danger')}
              className={`w-full flex items-center gap-2 px-3 py-2 text-[12px] rounded-lg transition-colors ${activeTab === 'danger' ? 'bg-red-500/10 text-red-400 font-medium' : 'text-[var(--text-secondary)] hover:bg-red-500/10 hover:text-red-400'}`}
            >
              <AlertTriangle className="w-4 h-4" /> {t('profile.dangerZone', 'Danger Zone')}
            </button>
          </nav>

          <div className="mt-4 pt-4 border-t border-[var(--border-subtle)]">
            <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-[var(--text-secondary)] hover:text-white hover:bg-[var(--surface-2)] rounded-lg transition-colors">
              <LogOut className="w-4 h-4" /> {t('profile.signOut', 'Sign Out')}
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
                  <h3 className="text-[16px] font-semibold text-[var(--text-primary)]">{t('profile.accountOverview', 'Account Overview')}</h3>
                  <p className="text-[12px] text-[var(--text-tertiary)]">{t('profile.manageProfile', 'Manage your display profile.')}</p>
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
                  <h4 className="text-[13px] font-medium text-[var(--text-primary)] mb-4">{t('profile.editProfile', 'Edit Profile')}</h4>
                  {isEditing ? (
                    <form onSubmit={handleSaveProfile} className="space-y-4">
                      <div>
                        <label className="text-[11px] font-medium block mb-1.5" style={{ color: 'var(--text-tertiary)' }}>{t('profile.displayName', 'Display Name')}</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)}
                          className="input w-full text-[13px]" />
                      </div>
                      <div>
                        <label className="text-[11px] font-medium block mb-1.5" style={{ color: 'var(--text-tertiary)' }}>{t('profile.avatar', 'Avatar')}</label>
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
                        
                        {/* Custom Upload */}
                        <div className="mt-2 flex items-center gap-3">
                          {selectedAvatar && !DEFAULT_AVATARS.includes(selectedAvatar) && (
                            <img src={selectedAvatar} alt="Custom" className="w-10 h-10 rounded-full object-cover border-2" style={{ borderColor: 'var(--accent)' }} />
                          )}
                          <label className="flex-1 flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg border border-dashed cursor-pointer transition-colors text-[12px] font-medium"
                            style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)', color: 'var(--text-secondary)' }}>
                            <Upload className="w-3.5 h-3.5" />
                            {t('profile.uploadCustom', 'Upload Custom Picture')}
                            <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" disabled={loading} />
                          </label>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button type="submit" disabled={loading} className="btn btn-primary px-5 text-[12px]">
                          {t('profile.saveChanges', 'Save Changes')}
                        </button>
                        <button type="button" onClick={() => setIsEditing(false)} disabled={loading} className="btn btn-secondary text-[12px]">
                          {t('profile.cancel', 'Cancel')}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <button onClick={() => { setIsEditing(true); setName(currentUser.name); setSelectedAvatar(currentUser.avatar); }}
                      className="btn btn-secondary w-full text-[12px] bg-[var(--surface-2)]">
                      <Edit3 className="w-3.5 h-3.5" /> {t('profile.editNameAvatar', 'Edit Display Name & Avatar')}
                    </button>
                  )}
                  {profileSuccess && (
                    <div className="mt-3 flex items-center gap-2 p-2.5 rounded-lg text-[12px] text-green-400 bg-green-500/10">
                      <Check className="w-3.5 h-3.5" /> {t('profile.profileUpdated', 'Profile updated successfully!')}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h3 className="text-[16px] font-semibold text-[var(--text-primary)]">{t('profile.securitySettings', 'Security Settings')}</h3>
                  <p className="text-[12px] text-[var(--text-tertiary)]">{t('profile.updatePasswordDesc', 'Update your password to keep your account secure.')}</p>
                </div>

                {currentUser.isGuest ? (
                  <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[13px]">
                    {t('profile.guestSecurityNotice', 'Guest accounts cannot change passwords. Please create a full account to use this feature.')}
                  </div>
                ) : (
                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div>
                      <label className="text-[12px] font-medium block mb-1.5 text-[var(--text-secondary)]">{t('profile.currentPassword', 'Current Password')}</label>
                      <input 
                        type="password" 
                        value={currentPassword} 
                        onChange={e => setCurrentPassword(e.target.value)}
                        className="input w-full text-[13px]" 
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[12px] font-medium block mb-1.5 text-[var(--text-secondary)]">{t('profile.newPassword', 'New Password')}</label>
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
                    {securitySuccess && <p className="text-[12px] text-green-400 mt-1 flex items-center gap-1"><Check className="w-3.5 h-3.5"/> {t('profile.passwordUpdated', 'Password updated successfully')}</p>}
                    
                    <button type="submit" className="btn btn-primary w-full text-[13px] mt-2">
                      {t('profile.updatePassword', 'Update Password')}
                    </button>
                  </form>
                )}
              </div>
            )}

            {activeTab === 'feedback' && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h3 className="text-[16px] font-semibold text-[var(--text-primary)]">{t('profile.feedbackTitle', 'Send Feedback')}</h3>
                  <p className="text-[12px] text-[var(--text-tertiary)]">{t('profile.feedbackDesc', 'Have a suggestion or found a bug? Let us know!')}</p>
                </div>
                
                <div className="p-5 rounded-xl bg-[var(--surface-2)] border border-[var(--border-subtle)] space-y-4">
                  <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
                    {t('profile.feedbackText', 'Your feedback helps us improve HappyGen Studio. Click the button below to send us an email directly.')}
                  </p>
                  
                  <a 
                    href="mailto:support@happygen.com?subject=HappyGen Studio Feedback"
                    className="btn btn-primary w-full flex items-center justify-center gap-2 text-[13px]"
                  >
                    <MessageSquare className="w-4 h-4" />
                    {t('profile.sendFeedback', 'Send Feedback via Email')}
                  </a>
                </div>
              </div>
            )}

            {activeTab === 'danger' && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h3 className="text-[16px] font-semibold text-red-400">{t('profile.dangerZone', 'Danger Zone')}</h3>
                  <p className="text-[12px] text-[var(--text-tertiary)]">{t('profile.irreversibleActions', 'Irreversible actions for your account.')}</p>
                </div>

                {currentUser.isGuest ? (
                  <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border-subtle)] text-[var(--text-secondary)] text-[13px]">
                    {t('profile.guestDangerNotice', 'Guest accounts are automatically wiped when you close the browser. No manual deletion needed.')}
                  </div>
                ) : (
                  <div className="p-5 rounded-xl bg-red-500/5 border border-red-500/20">
                    <h4 className="text-[14px] font-semibold text-red-400 mb-2">{t('profile.deleteAccount', 'Delete Account')}</h4>
                    <p className="text-[12px] text-red-400/80 mb-4 leading-relaxed">
                      {t('profile.deleteAccountDesc', 'Once you delete your account, there is no going back. All of your saved prompts and library items will be permanently erased from this device.')}
                    </p>
                    
                    <form onSubmit={handleDeleteAccount} className="space-y-3">
                      <div>
                        <label className="text-[12px] font-medium block mb-1.5 text-red-400/90">{t('profile.confirmPassword', 'Confirm Password')}</label>
                        <input 
                          type="password" 
                          value={deleteConfirmPassword} 
                          onChange={e => setDeleteConfirmPassword(e.target.value)}
                          className="input w-full text-[13px] bg-red-500/10 border-red-500/30 focus:border-red-500/60" 
                          required
                          placeholder={t('profile.enterPasswordConfirm', 'Enter password to confirm')}
                        />
                      </div>
                      
                      {deleteError && <p className="text-[12px] text-red-400 font-medium">{deleteError}</p>}
                      
                      <button 
                        type="submit" 
                        disabled={!deleteConfirmPassword}
                        className="btn w-full bg-red-500 hover:bg-red-600 text-white font-semibold disabled:opacity-50 text-[13px] border-none"
                      >
                        {t('profile.permanentlyDelete', 'Permanently Delete Account')}
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

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, X, Sparkles, LogOut, Award, Calendar, Image as ImageIcon, PlusCircle, Check, Edit3 } from 'lucide-react';

export default function UserProfileModal({ isOpen, onClose }) {
  const { currentUser, logout, updateProfile, addCredits, DEFAULT_AVATARS, openAuth } = useAuth();
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

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="max-w-lg w-full bg-slate-900/90 border border-indigo-500/30 rounded-3xl overflow-hidden shadow-2xl relative text-slate-100 backdrop-blur-2xl ring-1 ring-white/10">
        
        {/* Top Header Background */}
        <div className="h-28 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 relative flex items-center justify-end p-4">
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-2 rounded-full bg-black/30 hover:bg-black/50 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Profile Content */}
        <div className="p-6 pt-0 relative space-y-6">
          
          {/* Avatar & Basic Info */}
          <div className="flex items-end justify-between -mt-12">
            <div className="relative">
              <img
                src={currentUser.avatar || DEFAULT_AVATARS[0]}
                alt={currentUser.name}
                className="w-24 h-24 rounded-3xl object-cover border-4 border-slate-900 shadow-xl"
              />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center text-[10px] text-white font-bold" title="Online & Active">
                ✓
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center space-x-1.5 transition-all border border-white/10 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
                <span>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
              </button>
              <button
                onClick={handleLogout}
                className="px-3.5 py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 text-xs font-bold flex items-center space-x-1.5 transition-all border border-rose-500/30 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          {/* User Details */}
          {!isEditing ? (
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <h3 className="text-xl font-extrabold text-white">{currentUser.name}</h3>
                <span className="px-2 py-0.5 rounded-md bg-indigo-950 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold">
                  {currentUser.tier || 'Creator'}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">{currentUser.email}</p>
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Display Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:border-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Change Avatar</label>
                <div className="flex items-center space-x-2 overflow-x-auto pb-1">
                  {DEFAULT_AVATARS.map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedAvatar(url)}
                      className={`w-9 h-9 rounded-full overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                        selectedAvatar === url ? 'border-indigo-500 scale-110' : 'border-transparent opacity-60'
                      }`}
                    >
                      <img src={url} alt={`Avatar ${idx}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 cursor-pointer shadow-md"
              >
                <Check className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </form>
          )}

          {savedSuccess && (
            <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-bold text-center">
              Profile updated successfully!
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-white/10 text-center space-y-1">
              <Sparkles className="w-4 h-4 text-amber-400 mx-auto" />
              <div className="text-lg font-black text-white font-mono">{currentUser.credits ?? 150}</div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">AI Credits</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-white/10 text-center space-y-1">
              <ImageIcon className="w-4 h-4 text-indigo-400 mx-auto" />
              <div className="text-lg font-black text-white font-mono">{currentUser.generatedCount ?? 0}</div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Generations</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-white/10 text-center space-y-1">
              <Calendar className="w-4 h-4 text-emerald-400 mx-auto" />
              <div className="text-xs font-bold text-white mt-1">
                {currentUser.createdAt ? new Date(currentUser.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Active'}
              </div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Joined</div>
            </div>
          </div>

          {/* Claim Bonus Credits */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/60 via-purple-950/60 to-slate-950 border border-indigo-500/30 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-white flex items-center space-x-1.5">
                <Award className="w-4 h-4 text-amber-400" />
                <span>Creator Daily Bonus</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">Top up +50 free credits for your generations.</p>
            </div>
            <button
              onClick={() => addCredits(50)}
              className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-bold rounded-xl text-xs flex items-center space-x-1 transition-all shadow-md cursor-pointer hover:scale-105 active:scale-95"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>+50 Credits</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

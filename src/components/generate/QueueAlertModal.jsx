import React from 'react';
import { useTranslation } from 'react-i18next';
import { AlertCircle, X, ListPlus, XCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function QueueAlertModal({ onClose, onCancelCurrent, onQueue }) {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="card max-w-md w-full bg-[var(--surface-1)] border border-[var(--border-subtle)] shadow-2xl rounded-2xl overflow-hidden flex flex-col"
      >
        <div className="px-5 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--surface-2)]">
          <h3 className="font-bold text-[var(--text-primary)] flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-400" />
            Generation in Progress
          </h3>
          <button onClick={onClose} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-1 rounded-lg transition-colors hover:bg-[var(--surface-3)]">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-amber-400" />
          </div>
          <p className="text-[var(--text-secondary)] text-[14px] leading-relaxed mb-6">
            An image is currently being generated in the background. What would you like to do with this new request?
          </p>
          
          <div className="flex flex-col gap-3">
            <button 
              onClick={onQueue}
              className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 text-white py-3 px-4 rounded-xl transition-all font-medium"
            >
              <ListPlus className="w-4 h-4" />
              Queue Request (Runs automatically after)
            </button>
            
            <button 
              onClick={onCancelCurrent}
              className="w-full flex items-center justify-center gap-2 bg-[var(--surface-2)] border border-[var(--border-subtle)] hover:border-red-500/50 hover:bg-red-500/10 text-[var(--text-primary)] py-3 px-4 rounded-xl transition-all font-medium"
            >
              <XCircle className="w-4 h-4 text-red-400" />
              Cancel Current & Start New
            </button>

            <button 
              onClick={onClose}
              className="w-full flex items-center justify-center gap-2 bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] py-2 px-4 rounded-xl transition-all font-medium mt-1"
            >
              Just Wait
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

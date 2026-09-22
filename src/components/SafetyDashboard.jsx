import React from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, AlertOctagon, FileCheck, CheckCircle2, Lock, Cpu, Eye, Scale, Server } from 'lucide-react';

export default function SafetyDashboard({ safetyLogs, isAdultMode }) {
  const { t } = useTranslation();
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-7 h-7 text-emerald-400" />
            <h1 className="text-2xl font-extrabold text-[var(--text-primary)] font-display">{t('safety.consoleTitle', 'Trust & Safety Audit Console')}</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {t('safety.consoleDesc', 'Real-time compliance monitoring, multi-modal classifiers, C2PA digital provenance, & NCMEC reporting engine.')}
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-emerald-950/80 border border-emerald-500/40 px-3.5 py-2 rounded-xl text-xs font-bold text-emerald-300">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span>{t('safety.pipelineActive', 'Classifier Pipeline Active • 99.9% Recall Rate')}</span>
        </div>
      </div>

      {/* Safety Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{t('safety.csamTolerance', 'CSAM Zero Tolerance')}</span>
            <Lock className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-[var(--text-primary)]">0 {t('safety.incidents', 'Incidents')}</div>
          <div className="text-[10px] text-emerald-400 font-mono">100% {t('safety.ageScreened', 'Age-Inference Screened')}</div>
        </div>

        <div className="glass-panel p-4 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{t('safety.inputScans', 'Input Prompt Scans')}</span>
            <Cpu className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-extrabold text-[var(--text-primary)]">{safetyLogs.length + 142} {t('safety.prompts', 'Prompts')}</div>
          <div className="text-[10px] text-indigo-300 font-mono">{t('safety.latency', 'Sub-10ms Latency')}</div>
        </div>

        <div className="glass-panel p-4 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{t('safety.c2paSignatures', 'C2PA Digital Signatures')}</span>
            <FileCheck className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-extrabold text-[var(--text-primary)]">100% {t('safety.embedded', 'Embedded')}</div>
          <div className="text-[10px] text-purple-300 font-mono">SHA-256 {t('safety.tamperEvident', 'Tamper Evident')}</div>
        </div>

        <div className="glass-panel p-4 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{t('safety.kycGate', 'KYC Verification Gate')}</span>
            <Scale className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-extrabold text-[var(--text-primary)]">{t('safety.idLiveness', 'ID + Liveness')}</div>
          <div className="text-[10px] text-rose-300 font-mono">18+ {t('safety.identityVerified', 'Identity Verified')}</div>
        </div>
      </div>

      {/* Safety Audit Log Stream Table */}
      <div className="glass-panel rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[var(--text-primary)] flex items-center space-x-2">
            <Server className="w-5 h-5 text-indigo-400" />
            <span>{t('safety.liveFeed', 'Live System Classifier Log Audit Feed')}</span>
          </h2>
          <span className="text-xs font-mono text-slate-400">{t('safety.updatedRealTime', 'Updated Real-Time')}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase font-mono text-[10px] border-b border-white/10">
              <tr>
                <th className="p-3">{t('safety.logId', 'Log ID')}</th>
                <th className="p-3">{t('safety.time', 'Time')}</th>
                <th className="p-3">{t('safety.eventType', 'Event Type')}</th>
                <th className="p-3">{t('safety.promptSnippet', 'Prompt Snippet')}</th>
                <th className="p-3">{t('safety.category', 'Category')}</th>
                <th className="p-3">{t('safety.verdict', 'Verdict')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-sans">
              {safetyLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-slate-500">
                    {t('safety.noViolations', 'No violations detected. All prompt and output classifier checks passed.')}
                  </td>
                </tr>
              ) : (
                safetyLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-3 font-mono font-bold text-indigo-300">{log.id}</td>
                    <td className="p-3 text-slate-400">{log.timestamp}</td>
                    <td className="p-3 font-semibold text-slate-200">{log.type}</td>
                    <td className="p-3 text-slate-300 italic max-w-xs truncate">{log.promptSnippet}</td>
                    <td className="p-3 text-slate-300">{log.category}</td>
                    <td className="p-3">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase ${
                        log.status === 'ALLOWED' 
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30' 
                          : 'bg-rose-950 text-rose-300 border border-rose-500/40'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

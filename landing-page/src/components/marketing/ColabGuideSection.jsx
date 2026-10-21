import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Cloud, Terminal, Zap, CheckCircle2, 
  ExternalLink, ArrowRight, ShieldCheck, Cpu, Monitor, Smartphone, Server
} from 'lucide-react';

export function ColabGuideSection() {
  const [activeStep, setActiveStep] = useState(1);

  const steps = [
    {
      num: '01',
      title: 'One-Click Notebook Launch',
      desc: 'Open our official pre-configured Google Colab or Kaggle notebook with one click. Zero Linux or Python configuration needed.',
      badge: 'Colab & Kaggle Ready',
      icon: ExternalLink
    },
    {
      num: '02',
      title: 'Free 15GB – 30GB Cloud GPU Allocation',
      desc: 'Colab grants a dedicated Tesla T4 (15GB VRAM); Kaggle grants Dual T4s (30GB VRAM) or P100 (16GB) with 30 free GPU hours every week.',
      badge: 'Tesla T4 / P100',
      icon: Cpu
    },
    {
      num: '03',
      title: 'Instant Secure Bridge',
      desc: 'Copy the generated tunnel URL, paste it into HappyGen Studio (Desktop or Mobile APK), and generate with zero subscription limits.',
      badge: 'Instant Sync',
      icon: Zap
    }
  ];

  const computeNodes = [
    {
      title: 'Google Colab Cloud GPU',
      badge: '100% Free Tier',
      badgeColor: '#34d399',
      badgeBg: 'rgba(52, 211, 153, 0.12)',
      badgeBorder: 'rgba(52, 211, 153, 0.3)',
      icon: Cloud,
      specs: 'Nvidia Tesla T4 • 15GB VRAM',
      desc: 'Instant one-click launch. Run heavy SDXL base models, anime checkpoints, and LoRAs remotely with fast encrypted tunnel streaming.'
    },
    {
      title: 'Kaggle Dual Cloud GPU',
      badge: '30h / Week Free',
      badgeColor: '#38bdf8',
      badgeBg: 'rgba(56, 189, 248, 0.12)',
      badgeBorder: 'rgba(56, 189, 248, 0.3)',
      icon: Server,
      specs: 'Dual Nvidia T4 (30GB) or P100 (16GB)',
      desc: 'Generous weekly quota of high-end compute with dual-GPU parallel batch acceleration. Perfect for extended generation sessions and high-res fixes.'
    },
    {
      title: 'Local Hardware & Offline Vault',
      badge: 'Direct CUDA & MPS',
      badgeColor: '#818cf8',
      badgeBg: 'rgba(129, 140, 248, 0.12)',
      badgeBorder: 'rgba(129, 140, 248, 0.3)',
      icon: Cpu,
      specs: 'Nvidia RTX/GTX • Apple Silicon Metal (M1-M4)',
      desc: 'Total independence. Run fully disconnected from the internet. All model weights, confidential creations, and prompt histories stay strictly local.'
    }
  ];

  return (
    <div className="w-full max-w-[1560px] mx-auto my-12 sm:my-20 px-3.5 sm:px-6 lg:px-8 text-left">
      
      {/* ── Section Header ────────────────────────────────────────── */}
      <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
        <div 
          className="inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-wider mb-3 sm:mb-4"
          style={{
            color: '#34d399',
            background: 'rgba(52, 211, 153, 0.12)',
            border: '1px solid rgba(52, 211, 153, 0.3)'
          }}
        >
          <Cloud className="w-3.5 h-3.5" />
          <span>Free Cloud GPUs • Google Colab & Kaggle</span>
        </div>
        <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mb-3 sm:mb-4 leading-tight">
          No $2,000 GPU? <br className="hidden sm:inline" />
          <span className="text-slate-400 font-extrabold">
            Generate on Free Cloud GPUs in Seconds.
          </span>
        </h2>
        <p className="text-xs sm:text-base text-slate-400 leading-relaxed px-1">
          HappyGen Studio connects seamlessly to our pre-built Google Colab and Kaggle environments. Enjoy up to 30 free hours/week of dedicated Nvidia Tesla T4 and P100 GPUs without purchasing hardware or paying recurring fees.
        </p>
      </div>

      {/* ── 3-Step Process Cards ──────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-6 mb-8 sm:mb-12">
        {steps.map((step, idx) => {
          const isActive = activeStep === idx + 1;
          return (
            <div
              key={step.num}
              onClick={() => setActiveStep(idx + 1)}
              className="p-4 sm:p-7 rounded-xl sm:rounded-2xl border transition-all duration-200 cursor-pointer text-left relative overflow-hidden"
              style={{
                background: isActive ? '#0e122b' : '#080b18',
                borderColor: isActive ? 'rgba(52, 211, 153, 0.45)' : 'rgba(255, 255, 255, 0.07)',
                boxShadow: isActive ? '0 10px 30px -10px rgba(52, 211, 153, 0.2)' : 'none'
              }}
            >
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <span 
                  className="text-3xl sm:text-4xl font-black font-mono transition-colors"
                  style={{ color: isActive ? '#34d399' : '#334155' }}
                >
                  {step.num}
                </span>
                <span 
                  className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md text-[10px] sm:text-xs font-semibold font-mono"
                  style={{
                    background: isActive ? 'rgba(52, 211, 153, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                    color: isActive ? '#34d399' : '#94a3b8',
                    border: isActive ? '1px solid rgba(52, 211, 153, 0.3)' : '1px solid rgba(255, 255, 255, 0.05)'
                  }}
                >
                  {step.badge}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white mb-1.5 sm:mb-2">{step.title}</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{step.desc}</p>
            </div>
          );
        })}
      </div>

      {/* ── Compute Architecture Showcase (Colab + Kaggle + Local) ── */}
      <div 
        className="rounded-[18px] sm:rounded-[24px] p-4 sm:p-8 lg:p-10 border transition-all"
        style={{
          background: '#070914',
          borderColor: 'rgba(255, 255, 255, 0.08)',
          boxShadow: '0 20px 60px -15px rgba(0, 0, 0, 0.7)'
        }}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6 mb-6 sm:mb-10 pb-6 sm:pb-8 border-b border-white/[0.06]">
          <div>
            <div className="flex items-center gap-2 text-[11px] sm:text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 mb-1.5 sm:mb-2">
              <Server className="w-3.5 h-3.5" />
              <span>Hybrid Compute Architecture</span>
            </div>
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight">
              Flexible Compute. Zero Subscription Lock-In.
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
              Connect to free Google Colab or Kaggle cloud GPUs, or render locally using direct CUDA and Metal.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full sm:w-auto flex-shrink-0">
            <a
              href="https://colab.research.google.com/"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2.5 rounded-xl font-bold text-xs text-white flex items-center justify-center gap-1.5 transition-all hover:brightness-110 shadow-lg shadow-emerald-600/20 cursor-pointer w-full sm:w-auto"
              style={{
                background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)'
              }}
            >
              <span>Launch Colab</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <a
              href="https://www.kaggle.com/"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2.5 rounded-xl font-bold text-xs text-white flex items-center justify-center gap-1.5 transition-all hover:brightness-110 shadow-lg shadow-cyan-600/20 cursor-pointer w-full sm:w-auto"
              style={{
                background: 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)'
              }}
            >
              <span>Launch Kaggle (30h/wk)</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <Link
              to="/download"
              className="px-4 py-2.5 rounded-xl font-bold text-xs text-slate-300 hover:text-white border border-white/10 hover:border-white/20 transition-all cursor-pointer text-center flex items-center justify-center w-full sm:w-auto"
              style={{ background: '#0e122b' }}
            >
              Get Studio Binary
            </Link>
          </div>
        </div>

        {/* 3 Compute Architecture Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-6">
          {computeNodes.map((node, i) => {
            const Icon = node.icon;
            return (
              <div
                key={i}
                className="p-4 sm:p-6 rounded-xl sm:rounded-2xl border transition-all flex flex-col justify-between"
                style={{
                  background: '#0B0B1A',
                  borderColor: 'rgba(255, 255, 255, 0.06)'
                }}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{
                        background: node.badgeBg,
                        border: `1px solid ${node.badgeBorder}`,
                        color: node.badgeColor
                      }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span 
                      className="px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold"
                      style={{
                        background: node.badgeBg,
                        border: `1px solid ${node.badgeBorder}`,
                        color: node.badgeColor
                      }}
                    >
                      {node.badge}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-white mb-1.5">{node.title}</h4>
                  <div className="text-xs font-mono text-slate-400 mb-3">{node.specs}</div>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-4">
                    {node.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/[0.05] flex items-center gap-1.5 text-[11px] font-mono text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Fully Supported Pipeline</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}

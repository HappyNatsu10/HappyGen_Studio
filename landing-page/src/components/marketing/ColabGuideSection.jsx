import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Cloud, Terminal, Zap, CheckCircle2, XCircle, 
  ExternalLink, ArrowRight, ShieldCheck, Cpu, HardDrive 
} from 'lucide-react';

export function ColabGuideSection() {
  const [activeStep, setActiveStep] = useState(1);

  const steps = [
    {
      num: '01',
      title: 'One-Click Notebook Launch',
      desc: 'Open our official pre-configured Google Colab notebook. No coding or Linux knowledge needed.',
      badge: '1 Click',
      icon: ExternalLink
    },
    {
      num: '02',
      title: 'Free 15GB Cloud GPU Provisions',
      desc: 'Colab allocates a dedicated Nvidia Tesla T4 GPU with 15GB VRAM completely free of charge.',
      badge: 'Tesla T4',
      icon: Cpu
    },
    {
      num: '03',
      title: 'Paste Tunnel & Create',
      desc: 'Copy the secure tunnel URL, paste it into HappyGen Studio (Desktop or Mobile), and generate without limits.',
      badge: 'Zero Setup',
      icon: Zap
    }
  ];

  return (
    <div className="w-full max-w-6xl mx-auto my-20 px-4 sm:px-6">
      
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 mb-4">
          <Cloud className="w-3.5 h-3.5" />
          <span>Zero Hardware Cost • 100% Free Cloud GPUs</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4 leading-tight">
          No $2,000 GPU? <br className="hidden sm:inline" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
            Generate on Free Cloud GPUs in Seconds.
          </span>
        </h2>
        <p className="text-base sm:text-lg text-slate-400 leading-relaxed">
          HappyGen Studio connects seamlessly to our pre-built Google Colab environment. Enjoy the full power of high-end Nvidia GPUs without buying hardware or paying monthly subscriptions.
        </p>
      </div>

      {/* 3 Step Interactive Process Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-16">
        {steps.map((step, idx) => {
          const isActive = activeStep === idx + 1;
          return (
            <div
              key={step.num}
              onClick={() => setActiveStep(idx + 1)}
              className={`p-6 sm:p-7 rounded-2xl border transition-all duration-300 cursor-pointer text-left relative overflow-hidden group ${
                isActive
                  ? 'bg-slate-900 border-emerald-500/50 shadow-xl shadow-emerald-500/10 scale-[1.02]'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className={`text-4xl font-black font-mono transition-colors ${isActive ? 'text-emerald-400' : 'text-slate-700 group-hover:text-slate-500'}`}>
                  {step.num}
                </span>
                <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${isActive ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'}`}>
                  {step.badge}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Comparison Matrix: Native Workstation vs Closed Web SaaS */}
      <div className="rounded-3xl border border-slate-800 bg-slate-950/80 backdrop-blur-xl p-6 sm:p-10 shadow-2xl">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-white mb-2">Native Workstation vs. Web SaaS Subscriptions</h3>
          <p className="text-sm text-slate-400">See why running a native workstation gives you unprecedented freedom.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-400">
                <th className="py-4 px-4">Feature / Capability</th>
                <th className="py-4 px-4 text-emerald-400 bg-emerald-500/5 rounded-t-xl">HappyGen Studio (Native)</th>
                <th className="py-4 px-4 text-slate-500">Commercial Web AI (Midjourney/Runway)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-sm">
              <tr>
                <td className="py-3.5 px-4 font-semibold text-slate-200">Monthly Price</td>
                <td className="py-3.5 px-4 font-bold text-emerald-400 bg-emerald-500/5">100% Free ($0/mo)</td>
                <td className="py-3.5 px-4 text-slate-400">$10 – $60 / month recurring</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-semibold text-slate-200">CivitAI Model & LoRA Access</td>
                <td className="py-3.5 px-4 font-bold text-emerald-400 bg-emerald-500/5 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>50,000+ Base Models & LoRAs</span>
                </td>
                <td className="py-3.5 px-4 text-slate-400 flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-rose-500" />
                  <span>Locked proprietary models only</span>
                </td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-semibold text-slate-200">Data Privacy & Local Storage</td>
                <td className="py-3.5 px-4 font-bold text-emerald-400 bg-emerald-500/5 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Stored on your device only</span>
                </td>
                <td className="py-3.5 px-4 text-slate-400 flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-rose-500" />
                  <span>Logged and hosted on cloud servers</span>
                </td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-semibold text-slate-200">Inpainting & Face Fix (ADetailer)</td>
                <td className="py-3.5 px-4 font-bold text-emerald-400 bg-emerald-500/5 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Built-in surgical restoration</span>
                </td>
                <td className="py-3.5 px-4 text-slate-400 flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-rose-500" />
                  <span>Limited or basic variations</span>
                </td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-semibold text-slate-200">Background Generation</td>
                <td className="py-3.5 px-4 font-bold text-emerald-400 bg-emerald-500/5 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Desktop & Mobile push notifications</span>
                </td>
                <td className="py-3.5 px-4 text-slate-400 flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-slate-500" />
                  <span>Tab-dependent or Discord bots</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

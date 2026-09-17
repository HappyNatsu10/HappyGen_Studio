import React from 'react';
import { FileText, Rocket, ShieldCheck, Scale, AlertTriangle, Copyright } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TermsPage() {
  const sections = [
    {
      id: "agreement",
      title: "1. Agreement to Terms",
      icon: <FileText className="w-5 h-5 text-purple-400" />,
      content: (
        <>
          <p>
            By accessing or using HappyGen Studio (the "Service"), you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the Service.
          </p>
          <p>
            You must be at least 13 years old to use the Service. To access mature content or use features that may generate 18+ content (if applicable), you must be at least 18 years old or the age of majority in your jurisdiction.
          </p>
        </>
      )
    },
    {
      id: "usage",
      title: "2. Acceptable Use & Content Restrictions",
      icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
      content: (
        <>
          <p>
            HappyGen Studio provides powerful AI image and video generation tools. With this power comes the responsibility to use it safely. You agree <strong>NOT</strong> to use the Service to generate, share, or promote:
          </p>
          <ul className="list-disc pl-5 space-y-2 mt-4 text-slate-300">
            <li>Child Sexual Abuse Material (CSAM) or any exploitation of minors.</li>
            <li>Non-consensual intimate imagery (NCII) or deepfakes of real people without their explicit consent.</li>
            <li>Content that promotes violence, terrorism, self-harm, or hate speech against protected groups.</li>
            <li>Deceptive content meant to mislead the public (e.g., fake news, political disinformation).</li>
          </ul>
          <p className="mt-4">
            We reserve the right to monitor generated content (excluding encrypted Private Vaults) and terminate accounts that violate these restrictions without notice.
          </p>
        </>
      )
    },
    {
      id: "ownership",
      title: "3. Ownership and Licenses",
      icon: <Scale className="w-5 h-5 text-blue-400" />,
      content: (
        <>
          <p>
            <strong>Your Content:</strong> You retain all ownership rights to the images, videos, and workflows you generate using HappyGen Studio. We do not claim copyright over your generations.
          </p>
          <p>
            <strong>Our License:</strong> By generating public content on our platform, you grant HappyGen Studio a worldwide, non-exclusive, royalty-free license to host, display, and distribute that content to provide and improve the Service. Content stored in Private Vaults is exempt from public display licenses.
          </p>
          <p>
            <strong>Base Models and LoRAs:</strong> The use of specific models hosted on our platform (e.g., Flux, SDXL) may be subject to their respective open-source or commercial licenses. It is your responsibility to comply with the license terms of the specific engine you use.
          </p>
        </>
      )
    },
    {
      id: "credits",
      title: "4. Credits and Subscriptions",
      icon: <Rocket className="w-5 h-5 text-pink-400" />,
      content: (
        <>
          <p>
            The Service operates on a credit-based system for generation tasks.
          </p>
          <ul className="list-disc pl-5 space-y-2 mt-4 text-slate-300">
            <li><strong>Purchases:</strong> All purchases of subscriptions or credit packs are final and non-refundable, except where required by law.</li>
            <li><strong>No Cash Value:</strong> Credits hold no real-world monetary value and cannot be exchanged, sold, or transferred to other users for fiat currency.</li>
            <li><strong>Expiry:</strong> Subscriptions renew automatically unless canceled. Rollover limits for credits depend on your specific subscription tier.</li>
          </ul>
        </>
      )
    },
    {
      id: "dmca",
      title: "5. Copyright Policy (DMCA)",
      icon: <Copyright className="w-5 h-5 text-yellow-400" />,
      content: (
        <>
          <p>
            HappyGen Studio respects the intellectual property rights of others. If you believe that your copyrighted work has been copied or used in a way that constitutes copyright infringement, please submit a takedown request to <code>dmca@happygenstudio.ai</code> containing:
          </p>
          <ul className="list-disc pl-5 space-y-2 mt-4 text-slate-300">
            <li>A description of the copyrighted work.</li>
            <li>The URL or location of the infringing material on our site.</li>
            <li>Your contact information and a statement under penalty of perjury that the information is accurate and you are the copyright owner.</li>
          </ul>
        </>
      )
    },
    {
      id: "disclaimer",
      title: "6. Disclaimer of Warranties",
      icon: <AlertTriangle className="w-5 h-5 text-orange-400" />,
      content: (
        <>
          <p>
            THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE". HappyGen Studio makes no warranties, expressed or implied, regarding the availability, reliability, or accuracy of the AI generation engines. We do not guarantee that the generated content will meet your specific requirements or be free of artifacts.
          </p>
          <p>
            HappyGen Studio shall not be liable for any indirect, incidental, special, or consequential damages resulting from the use or inability to use the Service.
          </p>
        </>
      )
    }
  ];

  return (
    <div className="relative min-h-screen pt-32 pb-24 w-full bg-[var(--surface-0)] text-slate-300">
      <div className="w-full max-w-5xl mx-auto px-6 md:px-12 xl:px-24">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20 mx-auto mb-6">
            <Rocket className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-white">Terms of Service</h1>
          <p className="text-slate-400 text-lg">Last Updated: October 2026</p>
        </motion.div>

        {/* Content Container */}
        <div className="grid md:grid-cols-4 gap-8">
          
          {/* Table of Contents - Sidebar */}
          <div className="hidden md:block col-span-1">
            <div className="sticky top-24 bg-[var(--surface-1)] border border-[var(--border-subtle)] rounded-2xl p-6">
              <h3 className="text-white font-bold mb-4 uppercase tracking-wider text-xs">Table of Contents</h3>
              <ul className="space-y-3">
                {sections.map((section) => (
                  <li key={section.id}>
                    <a 
                      href={`#${section.id}`} 
                      className="text-sm text-slate-400 hover:text-purple-400 transition-colors flex items-center gap-2"
                    >
                      {section.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Main Content */}
          <div className="col-span-1 md:col-span-3 space-y-8">
            {sections.map((section, idx) => (
              <motion.section 
                key={section.id}
                id={section.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="scroll-mt-24 glass-panel p-8 rounded-[22px] border border-[var(--border-subtle)] bg-[var(--surface-1)]/60 backdrop-blur-sm"
              >
                <div className="flex items-center gap-3 mb-6 border-b border-[var(--border-subtle)] pb-4">
                  <div className="p-2 bg-[var(--surface-2)] rounded-lg border border-[var(--border-subtle)]">
                    {section.icon}
                  </div>
                  <h2 className="text-2xl font-bold text-white m-0">{section.title}</h2>
                </div>
                <div className="prose prose-invert max-w-none text-slate-300 prose-p:leading-relaxed prose-strong:text-white">
                  {section.content}
                </div>
              </motion.section>
            ))}
          </div>
        </div>
        
      </div>
    </div>
  );
}

import React from 'react';
import { Shield, Rocket, Database, Lock, Eye, Users, HardDrive } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PrivacyPage() {
  const sections = [
    {
      id: "information",
      title: "1. Information We Collect",
      icon: <Database className="w-5 h-5 text-blue-400" />,
      content: (
        <>
          <p>
            When you use HappyGen Studio, we collect certain information to provide and improve our services:
          </p>
          <ul className="list-disc pl-5 space-y-2 mt-4 text-slate-300">
            <li><strong>Account Data:</strong> Email address, username, and authentication tokens when you register or sign in.</li>
            <li><strong>Generation Data:</strong> The text prompts, seed numbers, negative prompts, and configuration settings (e.g., sampler, steps) you submit to our AI engines.</li>
            <li><strong>Asset Data:</strong> Images, videos, and masks generated on our platform, as well as any reference images you upload for Image-to-Image or ControlNet workflows.</li>
            <li><strong>Technical Data:</strong> Browser type, IP address, device information, and interaction metrics to help us optimize performance and security.</li>
          </ul>
        </>
      )
    },
    {
      id: "usage",
      title: "2. How We Use Your Data",
      icon: <Eye className="w-5 h-5 text-emerald-400" />,
      content: (
        <>
          <p>
            We use the collected information primarily to operate the HappyGen Studio workstation. Specifically, we use your data to:
          </p>
          <ul className="list-disc pl-5 space-y-2 mt-4 text-slate-300">
            <li>Route your generation requests to the appropriate AI engine (e.g., Flux, OpenAI, Runway).</li>
            <li>Store and organize your generated assets in your personal gallery.</li>
            <li>Process subscription payments and track credit usage.</li>
            <li>Monitor for abusive behavior, CSAM, and violations of our Terms of Service using automated safety filters.</li>
          </ul>
          <p className="mt-4">
            <strong>AI Training:</strong> We do NOT use the images you generate or your private prompts to train our own foundational AI models unless you explicitly opt-in to a community feedback program.
          </p>
        </>
      )
    },
    {
      id: "sharing",
      title: "3. Sharing with Third Parties",
      icon: <Users className="w-5 h-5 text-purple-400" />,
      content: (
        <>
          <p>
            Because HappyGen Studio aggregates multiple AI models, some of your data must be shared with our backend engine providers to fulfill your requests:
          </p>
          <ul className="list-disc pl-5 space-y-2 mt-4 text-slate-300">
            <li><strong>API Partners:</strong> When you use a closed-source engine (e.g., OpenAI's DALL-E 3, Runway's Gen-3), your prompt and generation parameters are sent to their respective APIs. These partners have their own strict data retention and privacy policies.</li>
            <li><strong>Service Providers:</strong> We use third-party cloud infrastructure (like AWS or Cloudflare) to securely host the platform and your images.</li>
          </ul>
          <p className="mt-4">
            We will never sell your personal data or generation history to advertisers or data brokers.
          </p>
        </>
      )
    },
    {
      id: "security",
      title: "4. Data Security & Private Vaults",
      icon: <Lock className="w-5 h-5 text-pink-400" />,
      content: (
        <>
          <p>
            We take the security of your creations seriously. 
          </p>
          <p className="mt-4">
            <strong>Private Vaults:</strong> Pro Creators have access to Private Vaults. Images and videos stored in Private Vaults are encrypted at rest and are completely isolated from public galleries. Only you and authorized personnel (in the event of a severe Terms of Service violation flag) can access these files.
          </p>
          <p className="mt-4">
            All data transmitted between your browser and our servers is secured using modern TLS encryption.
          </p>
        </>
      )
    },
    {
      id: "rights",
      title: "5. Your Privacy Rights",
      icon: <HardDrive className="w-5 h-5 text-yellow-400" />,
      content: (
        <>
          <p>
            Depending on your location (such as under the GDPR or CCPA), you have the right to:
          </p>
          <ul className="list-disc pl-5 space-y-2 mt-4 text-slate-300">
            <li><strong>Access:</strong> Request a full export of your account data and generation history.</li>
            <li><strong>Deletion:</strong> Request the permanent deletion of your account and all associated assets from our servers.</li>
            <li><strong>Opt-Out:</strong> Unsubscribe from marketing communications at any time.</li>
          </ul>
          <p className="mt-4">
            To exercise these rights, please navigate to your Account Settings or email us at <code>privacy@happygenstudio.ai</code>.
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
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-white">Privacy Policy</h1>
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

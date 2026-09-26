import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, Menu, X, Play, FileText, Download, Mail, ChevronRight } from 'lucide-react';
import { AuroraBackground } from './AuroraBackground';

const DiscordIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
  </svg>
);

const XIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);
const MarketingNavbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 bg-[var(--surface-0)]/40 backdrop-blur-xl border-b border-[var(--border-subtle)]"
      >
        <div className="w-full px-6 md:px-12 xl:px-24 mx-auto flex items-center h-20 relative">
          {/* Logo - Left */}
          <div className="flex-1 flex justify-start">
            <Link to="/" className="flex items-center gap-3 group">
              <img src="/logo.png" alt="HappyGen Studio Logo" className="w-10 h-10 object-contain group-hover:scale-105 transition-transform" />
              <span className="font-bold text-xl tracking-tight text-white">HappyGen Studio</span>
            </Link>
          </div>

          {/* Desktop Nav - Center */}
          <div className="hidden md:flex items-center justify-center gap-8 absolute left-1/2 -translate-x-1/2">
            <Link to="/walkthrough" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Walkthrough</Link>
            <Link to="/faq" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">FAQ</Link>
            <Link to="/download" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Download</Link>
          </div>

          {/* Contact - Right */}
          <div className="hidden md:flex items-center justify-end gap-4 flex-1">
            <a href="https://x.com/happygenstudio" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white transition-colors"><XIcon className="w-5 h-5" /></a>
            <a href="https://discord.gg/TNb3XcFaM" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white transition-colors mr-2"><DiscordIcon className="w-[22px] h-[22px]" /></a>
            <Link to="/contact" className="btn-primary btn-primary-glow px-4 py-2 rounded-lg font-medium text-slate-300 hover:text-white transition-colors">Contact</Link>
          </div>

          {/* Mobile Menu Button - Right */}
          <div className="md:hidden flex flex-1 justify-end">
            <button 
              className="p-2 text-slate-300 hover:text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-[var(--surface-0)]/95 backdrop-blur-3xl pt-24 px-6 md:hidden"
          >
            <div className="flex flex-col gap-6 text-lg">
              <Link to="/walkthrough" onClick={() => setMobileMenuOpen(false)} className="font-semibold text-white">Walkthrough</Link>
              <Link to="/faq" onClick={() => setMobileMenuOpen(false)} className="font-semibold text-white">FAQ</Link>
              <Link to="/download" onClick={() => setMobileMenuOpen(false)} className="font-semibold text-white">Download</Link>
              <div className="pt-4 mt-2 border-t border-[var(--border-subtle)] flex gap-6">
                <a href="https://x.com/happygenstudio" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white transition-colors"><XIcon className="w-6 h-6" /></a>
                <a href="https://discord.gg/TNb3XcFaM" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white transition-colors"><DiscordIcon className="w-6 h-6" /></a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const MarketingFooter = () => {
  return (
    <footer className="bg-[var(--surface-0)]/50 backdrop-blur-md border-t border-[var(--border-subtle)] pt-20 pb-10 relative z-10">
      <div className="w-full px-6 md:px-12 xl:px-24 mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        <div className="md:col-span-1">
          <Link to="/" className="flex items-center gap-3 mb-6">
            <img src="/logo.png" alt="HappyGen Studio Logo" className="w-10 h-10 object-contain group-hover:scale-105 transition-transform" />
            <span className="font-bold text-lg text-white">HappyGen Studio</span>
          </Link>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            The ultimate AI generation workstation. Pro-grade tools, infinite canvas, and seamless model management.
          </p>
        </div>
        
        <div>
          <h4 className="font-bold text-white mb-6 uppercase tracking-wider text-xs text-slate-500">Product</h4>
          <ul className="space-y-4">
            <li><Link to="/download" className="text-slate-400 hover:text-purple-400 text-sm transition-colors">Download App</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-white mb-6 uppercase tracking-wider text-xs text-slate-500">Resources</h4>
          <ul className="space-y-4">
            <li><Link to="/walkthrough" className="text-slate-400 hover:text-purple-400 text-sm transition-colors">Walkthrough & Guides</Link></li>
            <li><Link to="/faq" className="text-slate-400 hover:text-purple-400 text-sm transition-colors">FAQ</Link></li>
            <li><a href="https://civitai.com" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-purple-400 text-sm transition-colors">CivitAI Models</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-white mb-6 uppercase tracking-wider text-xs text-slate-500">Company</h4>
          <ul className="space-y-4">
            <li><Link to="/contact" className="text-slate-400 hover:text-purple-400 text-sm transition-colors">Contact Us</Link></li>
            <li><Link to="/privacy" className="text-slate-400 hover:text-purple-400 text-sm transition-colors">Privacy Policy</Link></li>
            <li><Link to="/terms" className="text-slate-400 hover:text-purple-400 text-sm transition-colors">Terms of Service</Link></li>
            <li className="pt-4 flex gap-4">
              <a href="https://x.com/happygenstudio" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white transition-colors"><XIcon className="w-5 h-5" /></a>
              <a href="https://discord.gg/TNb3XcFaM" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white transition-colors"><DiscordIcon className="w-5 h-5" /></a>
            </li>
          </ul>
        </div>
      </div>
      
      <div className="w-full px-6 md:px-12 xl:px-24 mx-auto border-t border-[var(--border-subtle)] pt-8 flex flex-col md:flex-row items-center justify-between">
        <p className="text-slate-500 text-sm">© 2026 HappyGen Studio. All rights reserved.</p>
        <div className="flex gap-4 mt-4 md:mt-0 text-xs text-slate-600">
          Built with ♥ by HappyNatsu10
        </div>
      </div>
    </footer>
  );
};

export default function MarketingLayout() {
  return (
    <AuroraBackground>
      <div className="relative font-sans text-slate-200 min-h-screen selection:bg-purple-500/30 w-full flex flex-col">
        <MarketingNavbar />
        
        {/* Main Content Area */}
        <main className="w-full flex-1 relative z-10 flex flex-col items-center">
          <Outlet />
        </main>
        
        <MarketingFooter />
      </div>
    </AuroraBackground>
  );
}

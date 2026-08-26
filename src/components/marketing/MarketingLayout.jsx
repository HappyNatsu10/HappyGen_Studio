import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, Menu, X, Play, FileText, Download, Mail, ChevronRight } from 'lucide-react';
import { AuroraBackground } from './AuroraBackground';

const MarketingNavbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 bg-[var(--surface-0)]/40 backdrop-blur-xl border-b border-[var(--border-subtle)]"
      >
        <div className="w-full px-6 md:px-12 xl:px-24 mx-auto flex items-center justify-between h-20">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:shadow-purple-500/40 transition-shadow">
              <Rocket className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white">HappyGen Studio</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/pricing" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Pricing</Link>
            <Link to="/walkthrough" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Walkthrough</Link>
            <Link to="/faq" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">FAQ</Link>
            <Link to="/download" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Download</Link>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link to="/contact" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Contact</Link>
            <Link to="/studio" className="btn btn-primary btn-primary-glow px-6 py-2.5 rounded-xl font-semibold flex items-center gap-2">
              <Play className="w-4 h-4 fill-current" />
              Launch Studio
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 text-slate-300 hover:text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
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
              <Link to="/pricing" onClick={() => setMobileMenuOpen(false)} className="font-semibold text-white">Pricing</Link>
              <Link to="/walkthrough" onClick={() => setMobileMenuOpen(false)} className="font-semibold text-white">Walkthrough</Link>
              <Link to="/faq" onClick={() => setMobileMenuOpen(false)} className="font-semibold text-white">FAQ</Link>
              <Link to="/download" onClick={() => setMobileMenuOpen(false)} className="font-semibold text-white">Download</Link>
              <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className="font-semibold text-white">Contact</Link>
              
              <div className="pt-6 border-t border-[var(--border-subtle)] mt-4">
                <Link to="/studio" onClick={() => setMobileMenuOpen(false)} className="btn btn-primary w-full py-4 justify-center text-lg rounded-xl">
                  Launch Studio
                </Link>
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
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
              <Rocket className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg text-white">HappyGen Studio</span>
          </Link>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            The ultimate AI generation workstation. Pro-grade tools, infinite canvas, and seamless model management.
          </p>
        </div>
        
        <div>
          <h4 className="font-bold text-white mb-6 uppercase tracking-wider text-xs text-slate-500">Product</h4>
          <ul className="space-y-4">
            <li><Link to="/pricing" className="text-slate-400 hover:text-purple-400 text-sm transition-colors">Pricing & Plans</Link></li>
            <li><Link to="/download" className="text-slate-400 hover:text-purple-400 text-sm transition-colors">Download App</Link></li>
            <li><Link to="/studio" className="text-slate-400 hover:text-purple-400 text-sm transition-colors flex items-center gap-2">Web Studio <ChevronRight className="w-3 h-3" /></Link></li>
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
          </ul>
        </div>
      </div>
      
      <div className="w-full px-6 md:px-12 xl:px-24 mx-auto border-t border-[var(--border-subtle)] pt-8 flex flex-col md:flex-row items-center justify-between">
        <p className="text-slate-500 text-sm">© 2026 HappyGen Studio. All rights reserved.</p>
        <div className="flex gap-4 mt-4 md:mt-0">
          <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:bg-white/10 hover:text-white transition-all"><FileText className="w-4 h-4" /></a>
          <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:bg-white/10 hover:text-white transition-all"><Download className="w-4 h-4" /></a>
          <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:bg-white/10 hover:text-white transition-all"><Mail className="w-4 h-4" /></a>
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

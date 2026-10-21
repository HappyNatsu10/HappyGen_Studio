import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
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
  const navigate = useNavigate();
  const location = useLocation();

  const scrollTo = (e, id) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 120);
      return;
    }
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      window.history.replaceState(null, '', window.location.pathname);
    }
  };

  return (
    <>
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 bg-[var(--surface-0)]/85 backdrop-blur-xl border-b border-[var(--border-subtle)]"
      >
        <div className="w-full max-w-[1500px] px-3.5 sm:px-6 lg:px-12 mx-auto flex items-center justify-between h-16 sm:h-20">
          {/* Logo - Left */}
          <Link to="/" className="flex items-center gap-2.5 sm:gap-3 group flex-shrink-0">
            <img src="/logo.png" alt="HappyGen Studio Logo" className="w-8 h-8 sm:w-9 sm:h-9 object-contain group-hover:scale-105 transition-transform flex-shrink-0" />
            <span className="font-bold text-base sm:text-lg lg:text-xl tracking-tight text-white truncate">HappyGen Studio</span>
          </Link>

          {/* Desktop Nav - Center (Visible on xl+ screens only to avoid any overlap) */}
          <div className="hidden xl:flex items-center justify-center gap-6 2xl:gap-8">
            <button onClick={(e) => scrollTo(e, 'demo')} className="text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer">
              Interactive Demo
            </button>
            <button onClick={(e) => scrollTo(e, 'features')} className="text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer">
              Features
            </button>
            <button onClick={(e) => scrollTo(e, 'colab')} className="text-xs font-semibold text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer">
              <span>Colab & Kaggle GPUs</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            </button>
            <Link to="/walkthrough" className="text-xs font-semibold text-slate-300 hover:text-white transition-colors">Walkthrough</Link>
            <Link to="/faq" className="text-xs font-semibold text-slate-300 hover:text-white transition-colors">FAQ</Link>
          </div>

          {/* Right Action Bar: Socials + Download + Hamburger (All Viewports) */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <div className="hidden lg:flex items-center gap-2 mr-1">
              <a href="https://x.com/happygenstudio" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white transition-colors p-1"><XIcon className="w-4 h-4" /></a>
              <a href="https://discord.gg/TNb3XcFaM" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white transition-colors p-1"><DiscordIcon className="w-[18px] h-[18px]" /></a>
            </div>

            <Link 
              to="/download" 
              className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition-all flex items-center gap-1.5 flex-shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download Workstation</span>
              <span className="sm:hidden">Download</span>
            </Link>

            {/* Mobile/Tablet Menu Button (Visible on screens below xl) */}
            <button 
              className="xl:hidden p-2 text-slate-300 hover:text-white cursor-pointer rounded-lg hover:bg-white/5 active:bg-white/10 transition-colors flex items-center justify-center flex-shrink-0"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay (Visible on screens below xl) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-[var(--surface-0)]/98 backdrop-blur-2xl pt-20 px-5 pb-8 xl:hidden overflow-y-auto max-h-[100dvh]"
          >
            <div className="flex flex-col gap-2.5 text-base pt-4">
              <button 
                onClick={(e) => scrollTo(e, 'demo')} 
                className="w-full py-3 px-4 rounded-xl text-left font-semibold text-white hover:bg-white/5 active:bg-white/10 transition-colors cursor-pointer flex items-center justify-between"
              >
                <span>Interactive Demo</span>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>
              <button 
                onClick={(e) => scrollTo(e, 'features')} 
                className="w-full py-3 px-4 rounded-xl text-left font-semibold text-white hover:bg-white/5 active:bg-white/10 transition-colors cursor-pointer flex items-center justify-between"
              >
                <span>Features</span>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>
              <button 
                onClick={(e) => scrollTo(e, 'colab')} 
                className="w-full py-3 px-4 rounded-xl font-semibold text-white hover:bg-white/5 active:bg-white/10 transition-colors flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span>Colab & Kaggle Free GPUs</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold font-mono">Free</span>
              </button>
              <Link 
                to="/walkthrough" 
                onClick={() => setMobileMenuOpen(false)} 
                className="w-full py-3 px-4 rounded-xl font-semibold text-white hover:bg-white/5 active:bg-white/10 transition-colors flex items-center justify-between"
              >
                <span>Walkthrough & Guides</span>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </Link>
              <Link 
                to="/faq" 
                onClick={() => setMobileMenuOpen(false)} 
                className="w-full py-3 px-4 rounded-xl font-semibold text-white hover:bg-white/5 active:bg-white/10 transition-colors flex items-center justify-between"
              >
                <span>FAQ</span>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </Link>

              <div className="pt-2">
                <Link 
                  to="/download" 
                  onClick={() => setMobileMenuOpen(false)} 
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-center text-sm shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 active:scale-[0.99] transition-transform"
                >
                  <Download className="w-4 h-4" />
                  <span>Download App (APK & Desktop)</span>
                </Link>
              </div>

              <div className="pt-6 mt-4 border-t border-[var(--border-subtle)] flex items-center justify-between px-2">
                <span className="text-xs text-slate-400">Connect with us</span>
                <div className="flex gap-4 items-center">
                  <a href="https://x.com/happygenstudio" target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-white/5 text-slate-400 hover:text-white transition-colors"><XIcon className="w-4 h-4" /></a>
                  <a href="https://discord.gg/TNb3XcFaM" target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-white/5 text-slate-400 hover:text-white transition-colors"><DiscordIcon className="w-[18px] h-[18px]" /></a>
                </div>
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
    <footer className="bg-[var(--surface-0)]/50 backdrop-blur-md border-t border-[var(--border-subtle)] pt-12 sm:pt-20 pb-8 sm:pb-10 relative z-10 w-full">
      <div className="w-full max-w-[1500px] px-6 lg:px-12 mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
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
      
      <div className="w-full max-w-[1500px] px-6 lg:px-12 mx-auto border-t border-[var(--border-subtle)] pt-8 flex flex-col md:flex-row items-center justify-between">
        <p className="text-slate-500 text-sm">© 2026 HappyGen Studio. All rights reserved.</p>
        <div className="flex gap-4 mt-4 md:mt-0 text-xs text-slate-600">
          Built with ♥ by HappyNatsu10
        </div>
      </div>
    </footer>
  );
};

export default function MarketingLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // If the browser URL contains a '#' hash (such as #download or legacy bookmarks)
    if (window.location.hash) {
      const hash = window.location.hash.replace('#', '');
      if (hash === 'download') {
        // Cleanly route to /download without '#'
        navigate('/download', { replace: true });
      } else {
        // Strip the hash from the address bar without reloading
        window.history.replaceState(null, '', window.location.pathname);
        setTimeout(() => {
          const el = document.getElementById(hash);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      }
    }
  }, [location.pathname, navigate]);

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

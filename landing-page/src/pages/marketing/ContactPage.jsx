import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, MessageSquare, MapPin, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Meteors } from '../../components/marketing/Meteors';

export default function ContactPage() {
  const [formStatus, setFormStatus] = useState('idle'); // 'idle', 'submitting', 'success', 'error'
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormStatus('submitting');
    setErrorMessage('');

    const formData = new FormData(e.target);
    
    // TODO: Replace with your actual Formspree ID or custom backend API endpoint
    const ENDPOINT = 'https://formspree.io/f/YOUR_FORM_ID_HERE';

    try {
      // NOTE: We are simulating a submission here for demonstration.
      // To make it live, uncomment the fetch code below and add your endpoint!
      
      /*
      const response = await fetch(ENDPOINT, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      });
      
      if (!response.ok) throw new Error('Failed to submit form');
      */

      // Simulated network delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setFormStatus('success');
      e.target.reset();
      
      // Reset success message after 5 seconds
      setTimeout(() => setFormStatus('idle'), 5000);
    } catch (error) {
      setFormStatus('error');
      setErrorMessage('Oops! There was a problem submitting your form. Please try again or email us directly.');
    }
  };

  return (
    <div className="relative min-h-screen pt-32 pb-24 overflow-hidden w-full">
      <Meteors number={30} />
      <div className="relative z-10 w-full px-6 md:px-12 xl:px-24 mx-auto max-w-[1600px]">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-white drop-shadow-lg">Get in touch</h1>
              <p className="text-lg text-slate-300">Have questions about Enterprise plans, API access, or just want to say hi? We'd love to hear from you.</p>
            </div>

            <div className="space-y-6">
              <a href="mailto:support@happygenstudio.online" className="flex items-start gap-4 group cursor-pointer">
                <div className="w-12 h-12 bg-purple-500/20 backdrop-blur-md rounded-xl flex items-center justify-center flex-shrink-0 border border-purple-500/30 group-hover:bg-purple-500/30 transition-colors">
                  <Mail className="w-6 h-6 text-purple-300" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1 drop-shadow-md group-hover:text-purple-300 transition-colors">Email</h3>
                  <p className="text-slate-300 text-sm">support@happygenstudio.online</p>
                </div>
              </a>
              
              <a href="https://discord.gg/TNb3XcFaM" target="_blank" rel="noreferrer" className="flex items-start gap-4 group cursor-pointer">
                <div className="w-12 h-12 bg-indigo-500/20 backdrop-blur-md rounded-xl flex items-center justify-center flex-shrink-0 border border-indigo-500/30 group-hover:bg-indigo-500/30 transition-colors">
                  <MessageSquare className="w-6 h-6 text-indigo-300" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1 drop-shadow-md group-hover:text-indigo-300 transition-colors">Discord</h3>
                  <p className="text-slate-300 text-sm">Join our community server</p>
                </div>
              </a>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-panel p-10 rounded-[22px] border border-[var(--border-subtle)] bg-[var(--surface-1)]/80 shadow-2xl"
          >
            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="firstName" className="text-sm font-medium text-slate-300">First Name</label>
                  <input type="text" id="firstName" name="firstName" required className="w-full bg-[var(--surface-0)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors shadow-inner" placeholder="John" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="lastName" className="text-sm font-medium text-slate-300">Last Name</label>
                  <input type="text" id="lastName" name="lastName" required className="w-full bg-[var(--surface-0)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors shadow-inner" placeholder="Doe" />
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-slate-300">Email Address</label>
                <input type="email" id="email" name="email" required className="w-full bg-[var(--surface-0)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors shadow-inner" placeholder="john@example.com" />
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium text-slate-300">Message</label>
                <textarea id="message" name="message" required rows="4" className="w-full bg-[var(--surface-0)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors resize-none shadow-inner" placeholder="How can we help you?"></textarea>
              </div>

              {formStatus === 'success' && (
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-3 text-green-400">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm font-medium">Message sent! We'll get back to you soon.</p>
                </div>
              )}

              {formStatus === 'error' && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm font-medium">{errorMessage}</p>
                </div>
              )}

              <button 
                type="submit" 
                disabled={formStatus === 'submitting'}
                className="btn btn-primary btn-primary-glow w-full py-4 rounded-xl text-white font-semibold text-lg flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {formStatus === 'submitting' ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Message'
                )}
              </button>
            </form>
          </motion.div>

        </div>
      </div>
    </div>
  );
}

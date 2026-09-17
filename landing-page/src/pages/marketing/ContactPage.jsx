import React from 'react';
import { motion } from 'framer-motion';
import { Mail, MessageSquare, MapPin } from 'lucide-react';
import { Meteors } from '../../components/marketing/Meteors';

export default function ContactPage() {
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
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-500/20 backdrop-blur-md rounded-xl flex items-center justify-center flex-shrink-0 border border-purple-500/30">
                  <Mail className="w-6 h-6 text-purple-300" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1 drop-shadow-md">Email</h3>
                  <p className="text-slate-300 text-sm">support@happygenstudio.ai</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-indigo-500/20 backdrop-blur-md rounded-xl flex items-center justify-center flex-shrink-0 border border-indigo-500/30">
                  <MessageSquare className="w-6 h-6 text-indigo-300" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1 drop-shadow-md">Discord</h3>
                  <p className="text-slate-300 text-sm">Join our community server</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-panel p-10 rounded-[22px] border border-[var(--border-subtle)] bg-[var(--surface-1)]/80 shadow-2xl"
          >
            <form className="space-y-6 relative z-10">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">First Name</label>
                  <input type="text" className="w-full bg-[var(--surface-0)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors shadow-inner" placeholder="John" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Last Name</label>
                  <input type="text" className="w-full bg-[var(--surface-0)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors shadow-inner" placeholder="Doe" />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Email Address</label>
                <input type="email" className="w-full bg-[var(--surface-0)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors shadow-inner" placeholder="john@example.com" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Message</label>
                <textarea rows="4" className="w-full bg-[var(--surface-0)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors resize-none shadow-inner" placeholder="How can we help you?"></textarea>
              </div>

              <button type="button" className="btn btn-primary btn-primary-glow w-full py-4 rounded-xl text-white font-semibold text-lg">
                Send Message
              </button>
            </form>
          </motion.div>

        </div>
      </div>
    </div>
  );
}

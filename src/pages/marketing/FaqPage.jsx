import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, MessageCircleQuestion } from 'lucide-react';

const FAQS = [
  {
    question: "Do I need a powerful GPU to use HappyGen Studio?",
    answer: "No! By default, HappyGen connects to blazing-fast cloud APIs (like Fal.ai) to process your generations. You can generate professional-grade images on low-end laptops or even mobile devices. We also support pointing to your own local ComfyUI/A1111 backend if you prefer to use your own GPU."
  },
  {
    question: "How do LoRAs work in the Studio?",
    answer: "You can stack multiple LoRAs (Low-Rank Adaptations) on top of a base model to fine-tune the style, character, or concept. Just browse the CivitAI database inside our 'Model Explorer', add them to your stack, and adjust their individual weights before generating."
  },
  {
    question: "Is there a limit to how many images I can generate?",
    answer: "Free users receive 100 daily credits, which is roughly enough for 50 standard images. Pro subscribers get unlimited generations and priority access to faster GPUs."
  },
  {
    question: "How does the Adult (18+) Vault work?",
    answer: "The Adult Vault is a secure, isolated section of your gallery. When 18+ mode is enabled in Settings, generations are saved here and blurred by default. It requires explicit confirmation to view, keeping your main workspace clean for professional environments."
  },
  {
    question: "Can I use the images commercially?",
    answer: "Images generated using public API models generally belong to you, but some specific models on CivitAI have custom licensing restrictions regarding commercial use. Please check the model's license page for details."
  }
];

export default function FaqPage() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="min-h-screen pt-32 pb-24 w-full">
      <div className="w-full max-w-5xl mx-auto px-6 md:px-12 xl:px-24">
        <div className="text-center mb-16">
          <MessageCircleQuestion className="w-12 h-12 text-purple-400 mx-auto mb-6" />
          <h1 className="text-4xl font-extrabold mb-4 text-white">Frequently Asked Questions</h1>
          <p className="text-slate-400">Everything you need to know about HappyGen Studio.</p>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-panel border border-[var(--border-subtle)] rounded-2xl overflow-hidden shadow-lg bg-[var(--surface-1)]/60 backdrop-blur-sm"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
                className="w-full px-6 py-5 flex items-center justify-between bg-white/5 hover:bg-white/10 transition-colors text-left"
              >
                <span className="font-semibold text-white pr-8">{faq.question}</span>
                <ChevronDown className={`w-5 h-5 text-purple-400 transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`} />
              </button>
              
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="px-6 pb-5 pt-2 text-slate-300 leading-relaxed border-t border-white/5">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

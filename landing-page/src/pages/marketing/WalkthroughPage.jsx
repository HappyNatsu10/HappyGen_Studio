import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Layers, Zap, Brush } from 'lucide-react';
import { TracingBeam } from '../../components/marketing/TracingBeam';

export default function WalkthroughPage() {
  return (
    <div className="relative w-full pt-32 pb-24 overflow-hidden">
      <div className="w-full px-6 md:px-12 xl:px-24 mx-auto max-w-[1400px]">
        
        <div className="text-center mb-16">
          <BookOpen className="w-12 h-12 text-purple-400 mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-white">Studio Walkthrough</h1>
          <p className="text-lg text-slate-400">Master HappyGen Studio with these quick guides.</p>
        </div>

        <TracingBeam className="px-6">
          <div className="space-y-12">
            {/* Guide 1 */}
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-panel p-10 rounded-[22px] border border-[var(--border-subtle)] bg-[var(--surface-1)]/80 shadow-xl"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-purple-500/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-purple-500/30">
                  <Layers className="w-6 h-6 text-purple-300" />
                </div>
                <h2 className="text-2xl font-bold text-white">Stacking LoRAs</h2>
              </div>
              <div className="prose prose-invert max-w-none text-slate-300">
                <p>LoRAs allow you to fine-tune the output of a base model (like Flux.1 or SDXL) to achieve specific styles, characters, or poses.</p>
                <ol className="list-decimal pl-5 space-y-2 mt-4 text-sm text-slate-300">
                  <li>Navigate to the <strong>Model Explorer</strong> tab.</li>
                  <li>Search for a concept (e.g. "Cyberpunk Style") and filter by "LORA".</li>
                  <li>Click <strong>Add to Stack</strong>.</li>
                  <li>Go back to the <strong>Generate</strong> tab. You will see your LoRA in the active stack.</li>
                  <li>Adjust the <strong>Weight</strong> slider. A weight of 0.8 is usually optimal. Too high (1.5) might distort the image, too low (0.2) might not have an effect.</li>
                </ol>
              </div>
            </motion.section>

            {/* Guide 2 */}
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-panel p-10 rounded-[22px] border border-[var(--border-subtle)] bg-[var(--surface-1)]/80 shadow-xl"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-pink-500/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-pink-500/30">
                  <Brush className="w-6 h-6 text-pink-300" />
                </div>
                <h2 className="text-2xl font-bold text-white">Inpainting Secrets</h2>
              </div>
              <div className="prose prose-invert max-w-none text-slate-300">
                <p>Inpainting allows you to regenerate specific parts of an image while keeping the rest intact.</p>
                <ul className="list-disc pl-5 space-y-2 mt-4 text-sm text-slate-300">
                  <li><strong>Draw the mask slightly larger</strong> than the object you want to replace. The AI needs context around the edges to blend properly.</li>
                  <li>Use <strong>High Denoising Strength (0.8+)</strong> if you want to completely change the object.</li>
                  <li>Use <strong>Low Denoising Strength (0.3 - 0.5)</strong> if you just want to fix small details (like a face or hands) without changing the overall structure.</li>
                </ul>
              </div>
            </motion.section>

            {/* Guide 3 */}
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-panel p-10 rounded-[22px] border border-[var(--border-subtle)] bg-[var(--surface-1)]/80 shadow-xl"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-yellow-500/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-yellow-500/30">
                  <Zap className="w-6 h-6 text-yellow-300" />
                </div>
                <h2 className="text-2xl font-bold text-white">Performance Optimization</h2>
              </div>
              <div className="prose prose-invert max-w-none text-slate-300">
                <p>If generations are taking too long, try these tips:</p>
                <ul className="list-disc pl-5 space-y-2 mt-4 text-sm text-slate-300">
                  <li>Switch to <strong>Draft Mode</strong>. This reduces the sampling steps to 6, delivering results in seconds.</li>
                  <li>Lower your batch count. Generating 4 images at once takes 4x longer on standard GPUs.</li>
                  <li>Upgrade to <strong>Pro Creator</strong> to access our dedicated High-VRAM GPU cluster.</li>
                </ul>
              </div>
            </motion.section>

          </div>
        </TracingBeam>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useAppStore from '../../store/useAppStore';
import { ArrowRight, Image as ImageIcon, Video, FolderOpen, Settings, CheckCircle2, ChevronLeft, ChevronRight, X } from 'lucide-react';

export default function OnboardingTutorial() {
  const { t } = useTranslation();
  const { setHasSeenTutorial } = useAppStore();
  const [currentStep, setCurrentStep] = useState(0);

  const TUTORIAL_STEPS = [
    {
      title: t('tutorial.step1.title', "Welcome to HappyGen Studio"),
      description: t('tutorial.step1.desc', "Your all-in-one workspace for generating, exploring, and organizing AI creations."),
      icon: <ImageIcon className="w-16 h-16 text-purple-500 mb-4 mx-auto" />,
      color: "var(--accent)"
    },
    {
      title: t('tutorial.step2.title', "Powerful Generation"),
      description: t('tutorial.step2.desc', "Use the Studio tab to generate images, create AI videos, or use the Inpaint editor to fix mistakes seamlessly."),
      icon: <Video className="w-16 h-16 text-blue-500 mb-4 mx-auto" />,
      color: "var(--accent)"
    },
    {
      title: t('tutorial.step3.title', "Organize Everything"),
      description: t('tutorial.step3.desc', "Your Gallery automatically saves all your creations and prompts. Filter, categorize, and build your own asset library."),
      icon: <FolderOpen className="w-16 h-16 text-emerald-500 mb-4 mx-auto" />,
      color: "var(--success)"
    },
    {
      title: t('tutorial.step4.title', "Configure Backend"),
      description: t('tutorial.step4.desc', "Connect to a Local GPU or a Google Colab instance via the Settings tab to start generating without limits."),
      icon: <Settings className="w-16 h-16 text-orange-500 mb-4 mx-auto" />,
      color: "var(--warning)"
    }
  ];

  const handleNext = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      setHasSeenTutorial(true);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    setHasSeenTutorial(true);
  };

  const stepInfo = TUTORIAL_STEPS[currentStep];
  const isLastStep = currentStep === TUTORIAL_STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-[#1c1c1e] border border-[#2c2c2e] rounded-2xl w-full max-w-md p-8 shadow-2xl relative overflow-hidden">
        
        {/* Skip button top right */}
        <button 
          onClick={handleSkip}
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="text-center py-6 animate-in slide-in-from-right-4 duration-300" key={currentStep}>
          {stepInfo.icon}
          <h2 className="text-2xl font-bold text-white mb-2">{stepInfo.title}</h2>
          <p className="text-gray-400 text-sm leading-relaxed max-w-sm mx-auto">
            {stepInfo.description}
          </p>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 my-6">
          {TUTORIAL_STEPS.map((_, idx) => (
            <div 
              key={idx}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentStep ? 'w-6 bg-purple-500' : 'w-2 bg-gray-600'
              }`}
            />
          ))}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between mt-4">
          <button 
            onClick={handlePrev}
            disabled={currentStep === 0}
            className={`p-2 rounded-lg transition-colors flex items-center gap-1 ${
              currentStep === 0 ? 'text-transparent cursor-default' : 'text-gray-400 hover:bg-white/10 hover:text-white'
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm font-medium">{t('tutorial.back', 'Back')}</span>
          </button>

          <button 
            onClick={handleNext}
            className={`px-6 py-2.5 rounded-lg font-medium text-sm flex items-center gap-2 transition-all ${
              isLastStep 
                ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_15px_rgba(147,51,234,0.5)]' 
                : 'bg-white text-black hover:bg-gray-200'
            }`}
          >
            {isLastStep ? t('tutorial.getStarted', 'Get Started') : t('tutorial.next', 'Next')}
            {isLastStep ? <CheckCircle2 className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
          </button>
        </div>

      </div>
    </div>
  );
}

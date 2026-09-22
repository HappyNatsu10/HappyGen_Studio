import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import useAppStore from '../../store/useAppStore';

export default function InteractiveTour() {
  const { t } = useTranslation();
  const { hasSeenInteractiveTour, setHasSeenInteractiveTour, setActiveTab, activeTab, hasSeenTutorial } = useAppStore();
  const hasStartedRef = useRef(false);

  useEffect(() => {
    if (hasSeenInteractiveTour) {
      hasStartedRef.current = false;
    }
  }, [hasSeenInteractiveTour]);

  useEffect(() => {
    if (!hasSeenTutorial || hasSeenInteractiveTour || hasStartedRef.current) return;
    
    // Check if we need to switch tabs first
    if (activeTab !== 'generate') {
      setActiveTab('generate');
      return; // The effect will re-run with activeTab === 'generate'
    }

    hasStartedRef.current = true;

    const isMobile = window.innerWidth < 768;

    // Delay slightly to ensure DOM is fully painted
    const timer = setTimeout(() => {
      const driverObj = driver({
        showProgress: true,
        allowClose: true,
        overlayColor: 'rgba(0, 0, 0, 0.75)',
        nextBtnText: t('tour.next', 'Next'),
        prevBtnText: t('tour.prev', 'Previous'),
        doneBtnText: t('tour.done', 'Done'),
        steps: [
          {
            element: '#tour-backend-config',
            popover: {
              title: t('tour.step1.title', 'Backend Configuration'),
              description: t('tour.step1.desc', 'First, make sure you are connected to your Local GPU or Cloud GPU here.'),
              side: "bottom", align: 'start'
            }
          },
          {
            element: '#tour-model-selector',
            popover: {
              title: t('tour.step2.title', 'Select a Model'),
              description: t('tour.step2.desc', 'Choose an AI model (like a Realistic or Anime model) from your collection.'),
              side: isMobile ? "bottom" : "right", align: 'center'
            }
          },
          {
            element: '#tour-prompt-box',
            popover: {
              title: t('tour.step3.title', 'Write your Prompt'),
              description: t('tour.step3.desc', 'Describe exactly what you want the AI to create in this box.'),
              side: isMobile ? "bottom" : "right", align: 'start'
            }
          },
          {
            element: '#tour-generate-button',
            popover: {
              title: t('tour.step4.title', 'Generate!'),
              description: t('tour.step4.desc', 'Click here to bring your imagination to life!'),
              side: isMobile ? "bottom" : "right", align: 'center'
            }
          },
          {
            element: isMobile ? '.tour-gallery-mobile' : '.tour-gallery-desktop',
            popover: {
              title: t('tour.step5.title', 'Your Gallery'),
              description: t('tour.step5.desc', 'All your generated images and videos will automatically be saved here. Enjoy HappyGen Studio!'),
              side: isMobile ? "top" : "right", align: isMobile ? 'center' : 'start'
            }
          }
        ],
        onDestroyStarted: () => {
          driverObj.destroy();
          setHasSeenInteractiveTour(true);
        },
      });

      driverObj.drive();
    }, 800);

    return () => clearTimeout(timer);
  }, [hasSeenInteractiveTour, activeTab, setActiveTab, setHasSeenInteractiveTour, hasSeenTutorial]);

  return null;
}

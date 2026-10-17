import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

let notificationsInitialized = false;

/**
 * Initializes notification channels and requests permissions on both mobile and desktop.
 */
export const initNotifications = async () => {
  if (typeof window === 'undefined') return;

  try {
    if (Capacitor.isNativePlatform()) {
      // 1. Android / iOS native permissions via Capacitor LocalNotifications
      const check = await LocalNotifications.checkPermissions();
      if (check.display !== 'granted') {
        await LocalNotifications.requestPermissions();
      }

      // Create high-priority channel on Android for heads-up notifications
      if (Capacitor.getPlatform() === 'android') {
        try {
          await LocalNotifications.createChannel({
            id: 'happygen_generations',
            name: 'Generation Alerts',
            description: 'Notifications when AI image generation finishes',
            importance: 5, // High importance (heads-up popup banner)
            visibility: 1,
            vibration: true,
            lights: true
          });
        } catch (chanErr) {
          console.log('Channel creation note:', chanErr);
        }
      }
    } else {
      // 2. Desktop (Electron) and Web Notification API
      if ('Notification' in window && Notification.permission === 'default') {
        await Notification.requestPermission();
      }
    }
    notificationsInitialized = true;
  } catch (err) {
    console.warn('Notification initialization notice:', err);
  }
};

/**
 * Plays a subtle, pleasant audio chime using the Web Audio API.
 * Requires no external audio files and is universally supported.
 */
export const playNotificationChime = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const now = ctx.currentTime;
    
    // Note 1: E5 (659.25 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, now);
    gain1.gain.setValueAtTime(0.12, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    // Note 2: B5 (987.77 Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(987.77, now + 0.12);
    gain2.gain.setValueAtTime(0.15, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.55);
  } catch (e) {
    // Audio context may be restricted if no user interaction yet
  }
};

/**
 * Pops up a notification when a generation finishes.
 * Works seamlessly across Mobile (Android/iOS background & foreground) and Desktop (Electron/Web).
 */
export const notifyGenerationDone = async ({
  title = '✨ Image Generated!',
  body = 'Your creation is ready in HappyGen Studio.',
  count = 1
} = {}) => {
  // Always play the subtle chime
  playNotificationChime();

  try {
    if (Capacitor.isNativePlatform()) {
      // Mobile native notification (pops up even when app is minimized / backgrounded)
      const notifId = Math.floor(Math.random() * 900000) + 100000;
      await LocalNotifications.schedule({
        notifications: [
          {
            id: notifId,
            title: title,
            body: body,
            channelId: 'happygen_generations',
            schedule: { at: new Date(Date.now() + 150) },
            smallIcon: 'ic_launcher',
            actionTypeId: '',
            extra: null
          }
        ]
      });
    } else {
      // Desktop / Web / Electron notification
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          new Notification(title, {
            body: body,
            icon: '/logo.png',
            tag: 'happygen-generation'
          });
        } else if (Notification.permission === 'default') {
          const perm = await Notification.requestPermission();
          if (perm === 'granted') {
            new Notification(title, {
              body: body,
              icon: '/logo.png',
              tag: 'happygen-generation'
            });
          }
        }
      }
    }
  } catch (err) {
    console.warn('Failed to display generation notification:', err);
  }
};

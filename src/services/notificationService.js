import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import logoSquareImg from '../assets/logo_square.png';

let notificationsInitialized = false;

/**
 * Ensures the Android high-priority notification channel is created.
 * Importance 5 (IMPORTANCE_HIGH) is required for heads-up popup banners
 * when the app is in the background or minimized.
 */
export const ensureNotificationChannel = async () => {
  if (typeof window === 'undefined') return;

  if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android') {
    try {
      await LocalNotifications.createChannel({
        id: 'happygen_generations',
        name: 'Generation Alerts',
        description: 'Notifications when AI image generation finishes',
        importance: 5, // High importance (heads-up popup banner)
        visibility: 1, // NotificationCompat.VISIBILITY_PUBLIC (shows on lockscreen)
        vibration: true,
        lights: true,
        lightColor: '#6366F1'
      });
    } catch (chanErr) {
      console.warn('Notification channel setup notice:', chanErr);
    }
  }
};

/**
 * Requests runtime notification permission across Android (POST_NOTIFICATIONS), iOS, and Web/Desktop.
 * Returns true if granted.
 */
export const requestNotificationPermission = async () => {
  if (typeof window === 'undefined') return false;

  try {
    if (Capacitor.isNativePlatform()) {
      // 1. Android / iOS native permissions via Capacitor LocalNotifications
      let check = await LocalNotifications.checkPermissions();
      if (check.display !== 'granted') {
        const req = await LocalNotifications.requestPermissions();
        check = req;
      }
      await ensureNotificationChannel();
      return check.display === 'granted';
    } else {
      // 2. Desktop (Electron) and Web Notification API
      if ('Notification' in window) {
        if (Notification.permission === 'granted') return true;
        if (Notification.permission !== 'denied') {
          const perm = await Notification.requestPermission();
          return perm === 'granted';
        }
      }
    }
  } catch (err) {
    console.warn('Error requesting notification permissions:', err);
  }
  return false;
};

/**
 * Initializes notification channels and requests permissions on app launch.
 */
export const initNotifications = async () => {
  if (typeof window === 'undefined') return;

  try {
    await ensureNotificationChannel();
    await requestNotificationPermission();
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
      // 1. Ensure channel is created with high priority
      await ensureNotificationChannel();

      // 2. Ensure permission is granted
      let check = await LocalNotifications.checkPermissions();
      if (check.display !== 'granted') {
        const req = await LocalNotifications.requestPermissions();
        if (req.display !== 'granted') {
          console.warn('Local notification permission not granted:', req.display);
          return;
        }
      }

      // 3. Immediately display the notification using Capacitor
      // Note: We deliberately omit 'schedule: { at: ... }' because immediate dispatch
      // calls Android's NotificationManager directly without relying on AlarmManager
      // or exact alarm permissions, guaranteeing instant heads-up delivery when backgrounded.
      const notifId = Math.floor(Math.random() * 900000) + 100000;
      await LocalNotifications.schedule({
        notifications: [
          {
            id: notifId,
            title: title,
            body: body,
            channelId: 'happygen_generations',
            smallIcon: 'ic_stat_happygen',
            iconColor: '#6366F1',
            actionTypeId: '',
            extra: null
          }
        ]
      });
    } else {
      // Desktop / Web / Electron notification
      if (typeof window !== 'undefined' && 'Notification' in window) {
        let notif = null;
        if (Notification.permission === 'granted') {
          notif = new Notification(title, {
            body: body,
            icon: logoSquareImg,
            tag: 'happygen-generation',
            requireInteraction: false
          });
        } else if (Notification.permission === 'default') {
          const perm = await Notification.requestPermission();
          if (perm === 'granted') {
            notif = new Notification(title, {
              body: body,
              icon: logoSquareImg,
              tag: 'happygen-generation',
              requireInteraction: false
            });
          }
        }

        if (notif) {
          notif.onclick = () => {
            window.focus();
            try {
              window.parent?.focus();
            } catch {}
          };
        }
      }
    }
  } catch (err) {
    console.warn('Failed to display generation notification:', err);
  }
};

/**
 * Returns current notification permission status: 'granted' | 'denied' | 'default' | 'unsupported'
 */
export const getNotificationPermissionStatus = () => {
  if (typeof window === 'undefined') return 'unsupported';
  if (Capacitor.isNativePlatform()) return 'granted';
  if ('Notification' in window) {
    return Notification.permission;
  }
  return 'unsupported';
};

/**
 * Sends a test notification to verify laptop desktop banners and chime audio
 */
export const sendTestNotification = async () => {
  await notifyGenerationDone({
    title: '🔔 Desktop Alert Active',
    body: 'Laptop notifications and audio alerts are working on your device!',
    count: 1
  });
};


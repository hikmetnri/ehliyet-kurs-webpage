import { getMessaging, getToken, isSupported, onMessage } from 'firebase/messaging';
import api from '../api';
import { app, firebaseConfig } from '../config/firebase';

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;
const TOKEN_SAVE_KEY = 'web_push_token_key';

let foregroundListenerStarted = false;

const canUseWebPush = async () => {
  if (typeof window === 'undefined') return false;
  if (!('serviceWorker' in navigator)) return false;
  if (!('Notification' in window)) return false;
  if (!VAPID_KEY) {
    console.info('Web push kapalı: VITE_FIREBASE_VAPID_KEY tanımlı değil.');
    return false;
  }

  try {
    return await isSupported();
  } catch {
    return false;
  }
};

const serviceWorkerUrl = () => {
  const params = new URLSearchParams({
    apiKey: firebaseConfig.apiKey || '',
    authDomain: firebaseConfig.authDomain || '',
    projectId: firebaseConfig.projectId || '',
    storageBucket: firebaseConfig.storageBucket || '',
    messagingSenderId: firebaseConfig.messagingSenderId || '',
    appId: firebaseConfig.appId || '',
  });

  return `/firebase-messaging-sw.js?${params.toString()}`;
};

const getRegistration = async () => {
  const targetUrl = new URL(serviceWorkerUrl(), window.location.origin).toString();
  const existing = await navigator.serviceWorker.getRegistration('/');
  if (existing?.active?.scriptURL === targetUrl) {
    return existing;
  }

  return navigator.serviceWorker.register(serviceWorkerUrl(), { scope: '/' });
};

const saveToken = async (token) => {
  const saveKey = `web:${token}`;
  if (sessionStorage.getItem(TOKEN_SAVE_KEY) === saveKey) return;

  await api.post('/notifications/fcm-token', {
    fcmToken: token,
    platform: 'web',
  });
  sessionStorage.setItem(TOKEN_SAVE_KEY, saveKey);
};

export const registerWebPushToken = async () => {
  if (!(await canUseWebPush())) return null;

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return null;

  const registration = await getRegistration();
  const messaging = getMessaging(app);
  const token = await getToken(messaging, {
    vapidKey: VAPID_KEY,
    serviceWorkerRegistration: registration,
  });

  if (!token) return null;
  await saveToken(token);
  return token;
};

export const startWebPushForegroundListener = async () => {
  if (foregroundListenerStarted || !(await canUseWebPush())) return;
  foregroundListenerStarted = true;

  const messaging = getMessaging(app);
  onMessage(messaging, (payload) => {
    const title = payload.notification?.title || payload.data?.title || 'Ehliyet Yolu';
    const body = payload.notification?.body || payload.data?.body || '';

    if (Notification.permission === 'granted' && (title || body)) {
      new Notification(title, {
        body,
        icon: '/logo_v2.png',
        data: payload.data || {},
      });
    }
  });
};

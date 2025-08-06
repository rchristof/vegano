// messaging.ts
export async function getMessagingSafe() {
  if (typeof window === 'undefined') return null; // SSR
  if (!window.isSecureContext) return null; // HTTPS or localhost
  if (!('serviceWorker' in navigator) || !('Notification' in window) || !('PushManager' in window)) {
    return null;
  }
  const [{ isSupported, getMessaging }, { app }] = await Promise.all([
    import('firebase/messaging'),
    import('@/firebaseConfig'), // adjust path if needed
  ]);
  if (!(await isSupported())) return null;
  return getMessaging(app);
}

// Returns the FCM token for push notifications, or null if not available
export async function getFcmToken() {
    try {
        const { getToken } = await import('firebase/messaging');

        // ✅ guarded + explicit registration passed to getToken
        const m = await getMessagingSafe();
        if (!m) return null;

        const reg = (await navigator.serviceWorker.getRegistration()) ?? (await navigator.serviceWorker.register('/firebase-messaging-sw.js'));

        if (Notification.permission === 'denied') return null;
        if (Notification.permission !== 'granted') {
            const perm = await Notification.requestPermission();
            if (perm !== 'granted') return null;
        }

        const token = await getToken(m, {
            vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY!,
            serviceWorkerRegistration: reg,
        });

        return token;
    } catch (err) {
        console.error('Failed to get FCM token', err);
        return null;
    }
}

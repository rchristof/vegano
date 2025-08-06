// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyAd-CH6FA-yT-raCUilL6wSaRwYv4M_Uus",
  authDomain: "vegano-bfcd6.firebaseapp.com",
  projectId: "vegano-bfcd6",
  storageBucket: "vegano-bfcd6.appspot.com",
  messagingSenderId: "987482377066",
  appId: "1:987482377066:web:d61e495a845ad85fe87313"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  // Customize notification here
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/firebase-logo.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
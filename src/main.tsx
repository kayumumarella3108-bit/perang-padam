import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Register Service Worker for offline capability
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('ServiceWorker registered with scope: ', registration.scope);
      })
      .catch((err) => {
        console.error('ServiceWorker registration failed: ', err);
      });
  });
} else if ('serviceWorker' in navigator) {
  // Always register in dev/preview as well for testing offline mode
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('ServiceWorker registered in dev/preview mode with scope: ', registration.scope);
      })
      .catch((err) => {
        console.warn('ServiceWorker registration failed in dev/preview:', err);
      });
  });
}

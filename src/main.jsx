import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Register lightweight offline-shell Service Worker for installable PWA support
if (typeof window !== 'undefined' && 'serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {
      // Non-fatal if SW registration is unavailable in restricted contexts
    });
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './style.scss';

if ('serviceWorker' in navigator) {
  // Optional extra manual registration (vite-plugin-pwa also injects one if auto)
  window.addEventListener('load', () => {
    navigator.serviceWorker.getRegistrations().then(() => {
      // Keep default autoUpdate behavior; this just ensures dev clarity
    });
  });
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

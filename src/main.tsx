import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App.tsx';

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Root element #root not found');

createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// Service worker registration (vite-plugin-pwa injects this via injectRegister: 'inline')
// No manual registration needed — the plugin handles it at build time.

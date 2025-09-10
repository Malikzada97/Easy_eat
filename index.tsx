import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// FIX: Corrected path for module resolution if needed, though the primary fix is providing content for AppContext.tsx
import { AppProvider } from './contexts/AppContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// FIX: To provide the most robust solution for the persistent React error #525,
// this implementation now caches the React root instance directly onto the
// DOM element itself.
//
// Rationale: The error occurs when `createRoot()` is called multiple times on the
// same element, a common issue in hot-reloading development environments. While
// caching the root on the global `window` object is a common pattern, it can fail
// in environments that aggressively reset or sandbox the `window` object between
// updates.
//
// By attaching our cache (`_reactRoot`) to the DOM element, we tie its lifetime
// directly to the element that persists across hot reloads. This is a more
// resilient strategy than relying on the global scope and is a professional,
// self-contained pattern to ensure the application initializes correctly only once.
// We use a non-standard property prefixed with an underscore to signal it's for
// internal use and avoid potential collisions.

// @ts-ignore - Extending the HTMLElement for our root cache.
let root = rootElement._reactRoot;

if (!root) {
  // @ts-ignore
  root = rootElement._reactRoot = ReactDOM.createRoot(rootElement);
}

root.render(
  <React.StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </React.StrictMode>
);

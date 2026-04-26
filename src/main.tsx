import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from '@/app/bootstrap/app';

import '@/app/styles/base.css';

const rootElement = document.getElementById('root');

if (!(rootElement instanceof HTMLDivElement)) {
  throw new Error('Root container #root was not found.');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);

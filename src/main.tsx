import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Import patch and synchronizer side-effects
import './real-estate-adjustments';
import './real-estate-metric-sync';
import './retirement-target-adjustment';
import './v2-header-footer-patch';
import './professional-audit-pdf-v3';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

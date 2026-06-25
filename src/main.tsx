import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Import patch and synchronizer side-effects
import './real-estate-adjustments';
import './real-estate-metric-sync';
import './retirement-target-adjustment';
import './pdf-previsor-box-fix';
import './pdf-report-chart-fix';
import './v2-header-footer-patch';
import './pdf-logo-size-patch';
import './pdf-full-width-text-patch';
import './pdf-currency-format-patch';
import './pdf-premium-closing-save-patch';
import './pdf-summary-width-fix';
import './professional-audit-pdf-v3';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

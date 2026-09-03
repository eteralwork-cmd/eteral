import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from "react-router-dom";
import { Analytics } from '@vercel/analytics/react';
import App from './LandingPage.tsx';
import { AuthProvider } from './lib/auth.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
    <Analytics />
  </StrictMode>
);
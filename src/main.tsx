import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from './LandingPage.tsx';
import PrivacyPolicy from './pages/PrivacyPolicy.tsx';
import TermsAndConditions from './pages/TermsAndConditions.tsx';
import { AuthProvider } from './lib/auth.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
// src/main.jsx or src/App.jsx


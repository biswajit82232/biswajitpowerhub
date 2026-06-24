import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import App from './App.jsx';
import { AuthProvider } from '@/context/AuthContext';
import { SiteSettingsProvider } from '@/context/SiteSettingsContext';
import { ToastProvider } from '@/components/ui/Toast';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <AuthProvider>
          <SiteSettingsProvider>
            <ToastProvider>
              <App />
            </ToastProvider>
          </SiteSettingsProvider>
        </AuthProvider>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
);

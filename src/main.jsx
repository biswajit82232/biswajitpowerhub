import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import App from './App.jsx';
import { AuthProvider } from '@/context/AuthContext';
import { LocaleProvider } from '@/context/LocaleContext';
import { SiteSettingsProvider } from '@/context/SiteSettingsContext';
import { FinanceSettingsProvider } from '@/context/FinanceSettingsContext';
import { SitePhotosProvider } from '@/context/SitePhotosContext';
import { ToastProvider } from '@/components/ui/Toast';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <HelmetProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <AuthProvider>
            <LocaleProvider>
              <SiteSettingsProvider>
                <FinanceSettingsProvider>
                  <SitePhotosProvider>
                    <ToastProvider>
                      <App />
                    </ToastProvider>
                  </SitePhotosProvider>
                </FinanceSettingsProvider>
              </SiteSettingsProvider>
            </LocaleProvider>
          </AuthProvider>
        </BrowserRouter>
      </HelmetProvider>
    </ErrorBoundary>
  </React.StrictMode>
);

/* eslint-disable react-refresh/only-export-components */
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Toaster } from "@/components/ui/sonner";
import { I18nextProvider } from 'react-i18next';
import i18n from './lib/i18n';
import EnhancedDevMentorPopup from './components/EnhancedDevMentorPopup';
import './index.css';

const PopupApp = () => (
  <I18nextProvider i18n={i18n}>
    <Toaster />
    <EnhancedDevMentorPopup />
  </I18nextProvider>
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <PopupApp />
  </React.StrictMode>
);














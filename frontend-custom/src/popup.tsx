import React from 'react';
import ReactDOM from 'react-dom/client';
import { Toaster } from "@/components/ui/sonner";
import DevMentorPopup from './components/DevMentorPopup';
import './index.css';

const PopupApp = () => (
  <>
    <Toaster />
    <DevMentorPopup />
  </>
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <PopupApp />
  </React.StrictMode>
);














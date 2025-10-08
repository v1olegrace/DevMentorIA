import React from 'react';
import ReactDOM from 'react-dom/client';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import DevMentorPopup from './components/DevMentorPopup';

const PopupApp = () => (
  <TooltipProvider>
    <Toaster />
    <Sonner />
    <DevMentorPopup />
  </TooltipProvider>
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <PopupApp />
  </React.StrictMode>
);

import React from 'react';
import ReactDOM from 'react-dom/client';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import DevMentorOptions from './components/DevMentorOptions';

const OptionsApp = () => (
  <TooltipProvider>
    <Toaster />
    <Sonner />
    <DevMentorOptions />
  </TooltipProvider>
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <OptionsApp />
  </React.StrictMode>
);

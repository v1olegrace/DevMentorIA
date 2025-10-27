/* global chrome */
/* eslint-disable no-console */

/**
 * DevMentor AI - DevTools Script
 * Registers the custom panel inside Chrome DevTools.
 */

chrome.devtools.panels.create(
  'DevMentor AI',
  '/devtools/icon.png',
  '/devtools/panel.html',
  panel => {
    console.log('[DevTools] Panel created');

    panel.onShown.addListener(panelWindow => {
      console.log('[DevTools] Panel shown');
      panelWindow.dispatchEvent(new Event('panel-init'));
    });

    panel.onHidden.addListener(() => {
      console.log('[DevTools] Panel hidden');
    });
  }
);

console.log('[DevTools] DevMentor AI DevTools script loaded');

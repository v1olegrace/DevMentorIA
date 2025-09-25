/**
 * DevMentor AI - Result Templates
 * HTML template helpers for rendering results consistently
 */

window.ResultTemplates = {
  header: ({ type, icon, title, language, timestamp }) => `
    <div class="devmentor-result-header">
      <span class="devmentor-result-icon">${icon}</span>
      <h3 class="devmentor-result-title">${title}</h3>
      <div class="devmentor-result-meta">
        ${language ? `<span class="devmentor-language-badge">${language}</span>` : ''}
        <span>${new Date(timestamp || Date.now()).toLocaleTimeString()}</span>
      </div>
    </div>
  `,

  content: (html) => `
    <div class="devmentor-result-content">
      <div class="devmentor-result-text">${html}</div>
    </div>
  `,

  actions: () => `
    <div class="devmentor-result-actions">
      <button class="devmentor-button primary" data-action="copy">Copy</button>
      <button class="devmentor-button" data-action="hide">Close</button>
    </div>
  `
};














/**
 * DevMentor AI - Media-Rich Explanation Styles
 * Estilos CSS profissionais para todas as funcionalidades de explicação rica
 */

const MEDIA_RICH_STYLES = `
/* ===== VARIÁVEIS CSS ===== */
:root {
  /* Cores principais */
  --primary-color: #1976d2;
  --primary-light: #42a5f5;
  --primary-dark: #1565c0;
  --secondary-color: #26a69a;
  --accent-color: #ff7043;
  
  /* Cores de status */
  --success-color: #4caf50;
  --warning-color: #ff9800;
  --error-color: #f44336;
  --info-color: #2196f3;
  
  /* Cores de superfície */
  --surface-color: #ffffff;
  --surface-variant: #f5f5f5;
  --surface-container: #fafafa;
  --surface-container-high: #eeeeee;
  
  /* Cores de texto */
  --on-surface: #212121;
  --on-surface-variant: #757575;
  --on-primary: #ffffff;
  
  /* Sombras */
  --shadow-1: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
  --shadow-2: 0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23);
  --shadow-3: 0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23);
  
  /* Bordas */
  --border-radius: 8px;
  --border-radius-large: 12px;
  --border-color: #e0e0e0;
  
  /* Espaçamentos */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  
  /* Tipografia */
  --font-family: 'Roboto', 'Segoe UI', system-ui, sans-serif;
  --font-family-mono: 'Roboto Mono', 'Consolas', monospace;
  --font-size-xs: 12px;
  --font-size-sm: 14px;
  --font-size-md: 16px;
  --font-size-lg: 18px;
  --font-size-xl: 20px;
  --font-size-xxl: 24px;
  
  /* Transições */
  --transition-fast: 0.15s ease;
  --transition-normal: 0.3s ease;
  --transition-slow: 0.5s ease;
}

/* ===== EXPLICAÇÃO RICA PRINCIPAL ===== */
.devmentor-rich-explanation {
  font-family: var(--font-family);
  line-height: 1.6;
  color: var(--on-surface);
  background: var(--surface-color);
  border-radius: var(--border-radius-large);
  box-shadow: var(--shadow-2);
  overflow: hidden;
  margin: var(--spacing-lg) 0;
}

/* Hero Section */
.explanation-hero {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
  color: var(--on-primary);
  padding: var(--spacing-xl);
  text-align: center;
  position: relative;
  overflow: hidden;
}

.explanation-hero::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="50" cy="50" r="1" fill="rgba(255,255,255,0.1)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
  opacity: 0.3;
}

.hero-content {
  position: relative;
  z-index: 1;
}

.hero-title {
  font-size: var(--font-size-xxl);
  font-weight: 600;
  margin: 0 0 var(--spacing-md) 0;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.hero-meta {
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
  flex-wrap: wrap;
}

.hero-meta span {
  background: rgba(255,255,255,0.2);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius);
  font-size: var(--font-size-sm);
  backdrop-filter: blur(10px);
}

.difficulty {
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.difficulty.beginner { background: var(--success-color); }
.difficulty.intermediate { background: var(--warning-color); }
.difficulty.advanced { background: var(--error-color); }

/* Hero Video */
.hero-video {
  position: relative;
  margin-top: var(--spacing-lg);
  border-radius: var(--border-radius);
  overflow: hidden;
  box-shadow: var(--shadow-3);
}

.intro-video {
  width: 100%;
  height: auto;
  display: block;
}

.video-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  pointer-events: none;
}

.play-button {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(0,0,0,0.7);
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  transition: var(--transition-normal);
  pointer-events: all;
}

.play-button:hover {
  background: rgba(0,0,0,0.9);
  transform: scale(1.1);
}

.video-duration {
  margin-top: var(--spacing-sm);
  font-size: var(--font-size-sm);
  background: rgba(0,0,0,0.7);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius);
}

/* ===== NAVEGAÇÃO ===== */
.explanation-nav {
  background: var(--surface-container);
  border-bottom: 1px solid var(--border-color);
  padding: 0 var(--spacing-lg);
}

.nav-tabs {
  display: flex;
  gap: var(--spacing-sm);
  overflow-x: auto;
}

.nav-tab {
  background: none;
  border: none;
  padding: var(--spacing-md) var(--spacing-lg);
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--on-surface-variant);
  cursor: pointer;
  border-bottom: 3px solid transparent;
  transition: var(--transition-fast);
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.nav-tab:hover {
  color: var(--primary-color);
  background: var(--surface-container-high);
}

.nav-tab.active {
  color: var(--primary-color);
  border-bottom-color: var(--primary-color);
  background: var(--surface-color);
}

/* ===== SEÇÕES DE CONTEÚDO ===== */
.explanation-sections {
  position: relative;
}

.section-panel {
  display: none;
  padding: var(--spacing-xl);
  animation: fadeIn 0.3s ease;
}

.section-panel.active {
  display: block;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.section-content {
  max-width: 100%;
}

/* ===== CITAÇÕES ===== */
.devmentor-citations {
  background: var(--surface-container);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-large);
  padding: var(--spacing-lg);
  margin: var(--spacing-lg) 0;
}

.citations-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  flex-wrap: wrap;
  gap: var(--spacing-md);
}

.citations-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--on-surface);
  margin: 0;
}

.citations-subtitle {
  color: var(--on-surface-variant);
  font-size: var(--font-size-sm);
  margin: var(--spacing-xs) 0 0 0;
}

.expand-all-citations {
  background: var(--primary-color);
  color: var(--on-primary);
  border: none;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: var(--transition-fast);
}

.expand-all-citations:hover {
  background: var(--primary-dark);
}

.citations-grid {
  display: grid;
  gap: var(--spacing-lg);
}

.citation-section {
  border-left: 4px solid var(--primary-color);
  padding-left: var(--spacing-md);
}

.section-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--font-size-md);
  font-weight: 600;
  color: var(--primary-color);
  margin: 0 0 var(--spacing-md) 0;
}

.badge {
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius);
  font-size: var(--font-size-xs);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.badge.official { background: var(--success-color); color: white; }
.badge.community { background: var(--info-color); color: white; }
.badge.video { background: var(--error-color); color: white; }
.badge.code { background: var(--warning-color); color: white; }
.badge.academic { background: var(--secondary-color); color: white; }

.citation-list {
  display: grid;
  gap: var(--spacing-md);
}

.citation-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--surface-color);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  text-decoration: none;
  color: inherit;
  transition: var(--transition-normal);
  position: relative;
  overflow: hidden;
}

.citation-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: var(--primary-color);
  transform: scaleY(0);
  transition: var(--transition-fast);
}

.citation-card:hover {
  border-color: var(--primary-color);
  background: var(--surface-container-high);
  transform: translateX(4px);
  box-shadow: var(--shadow-1);
}

.citation-card:hover::before {
  transform: scaleY(1);
}

.citation-icon {
  font-size: 24px;
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--surface-container);
  border-radius: var(--border-radius);
}

.citation-content {
  flex: 1;
  min-width: 0;
}

.citation-title {
  font-weight: 600;
  color: var(--on-surface);
  margin-bottom: var(--spacing-xs);
  line-height: 1.4;
}

.citation-source {
  font-size: var(--font-size-sm);
  color: var(--on-surface-variant);
  margin-bottom: var(--spacing-xs);
}

.citation-excerpt {
  font-size: var(--font-size-sm);
  color: var(--on-surface-variant);
  line-height: 1.5;
  margin: var(--spacing-xs) 0;
}

.citation-meta {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
  margin-top: var(--spacing-xs);
}

.citation-meta span {
  font-size: var(--font-size-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  background: var(--surface-container);
  border-radius: var(--border-radius);
  color: var(--on-surface-variant);
}

.citation-arrow {
  font-size: 18px;
  color: var(--primary-color);
  opacity: 0;
  transition: var(--transition-fast);
}

.citation-card:hover .citation-arrow {
  opacity: 1;
}

/* ===== PLAYGROUND INTERATIVO ===== */
.devmentor-playground {
  background: var(--surface-container);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-large);
  overflow: hidden;
  margin: var(--spacing-lg) 0;
}

.playground-header {
  background: var(--primary-color);
  color: var(--on-primary);
  padding: var(--spacing-md) var(--spacing-lg);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--spacing-md);
}

.playground-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin: 0;
  font-size: var(--font-size-md);
  font-weight: 600;
}

.playground-controls {
  display: flex;
  gap: var(--spacing-sm);
  align-items: center;
  flex-wrap: wrap;
}

.playground-controls button,
.playground-controls select {
  padding: var(--spacing-sm) var(--spacing-md);
  border: none;
  border-radius: var(--border-radius);
  background: rgba(255,255,255,0.2);
  color: var(--on-primary);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: var(--transition-fast);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.playground-controls button:hover,
.playground-controls select:hover {
  background: rgba(255,255,255,0.3);
}

.playground-controls select {
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.3);
}

.playground-body {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
  min-height: 400px;
}

@media (max-width: 768px) {
  .playground-body {
    grid-template-columns: 1fr;
  }
}

.editor-panel,
.output-panel,
.visualizer-panel {
  border-right: 1px solid var(--border-color);
}

.visualizer-panel {
  border-right: none;
  border-top: 1px solid var(--border-color);
}

.panel-header {
  background: var(--surface-container-high);
  padding: var(--spacing-sm) var(--spacing-md);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-color);
}

.panel-title {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--on-surface);
  margin: 0;
}

.language-badge {
  background: var(--primary-color);
  color: var(--on-primary);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius);
  font-size: var(--font-size-xs);
  font-weight: 600;
}

.editor-stats {
  display: flex;
  gap: var(--spacing-sm);
  font-size: var(--font-size-xs);
  color: var(--on-surface-variant);
}

.code-editor-container {
  position: relative;
  height: 300px;
}

#playgroundEditor {
  width: 100%;
  height: 100%;
  padding: var(--spacing-md);
  background: var(--surface-color);
  border: none;
  color: var(--on-surface);
  font-family: var(--font-family-mono);
  font-size: var(--font-size-sm);
  line-height: 1.5;
  resize: none;
  outline: none;
}

.editor-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.line-numbers {
  position: absolute;
  left: 0;
  top: var(--spacing-md);
  padding-right: var(--spacing-sm);
  font-family: var(--font-family-mono);
  font-size: var(--font-size-sm);
  color: var(--on-surface-variant);
  line-height: 1.5;
}

.output-controls {
  display: flex;
  gap: var(--spacing-sm);
}

.output-controls button {
  background: none;
  border: none;
  color: var(--primary-color);
  cursor: pointer;
  font-size: var(--font-size-xs);
  padding: var(--spacing-xs);
  border-radius: var(--border-radius);
  transition: var(--transition-fast);
}

.output-controls button:hover {
  background: var(--surface-container);
}

.console-output {
  padding: var(--spacing-md);
  background: var(--surface-color);
  color: var(--on-surface);
  font-family: var(--font-family-mono);
  font-size: var(--font-size-sm);
  line-height: 1.6;
  height: 300px;
  overflow-y: auto;
}

.output-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--on-surface-variant);
  text-align: center;
}

.placeholder-icon {
  font-size: 48px;
  margin-bottom: var(--spacing-md);
  opacity: 0.5;
}

.placeholder-text {
  font-size: var(--font-size-sm);
}

.output-line {
  padding: var(--spacing-xs) 0;
  border-left: 3px solid transparent;
  padding-left: var(--spacing-sm);
  margin-bottom: var(--spacing-xs);
}

.output-line.log {
  border-left-color: var(--success-color);
}

.output-line.error {
  border-left-color: var(--error-color);
  color: var(--error-color);
}

.output-line.warn {
  border-left-color: var(--warning-color);
  color: var(--warning-color);
}

.output-line.return {
  border-left-color: var(--info-color);
  color: var(--info-color);
  font-weight: 600;
}

.timestamp {
  color: var(--on-surface-variant);
  font-size: var(--font-size-xs);
  margin-right: var(--spacing-sm);
}

/* ===== METÁFORAS VISUAIS ===== */
.visual-metaphor {
  background: var(--surface-color);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-large);
  padding: var(--spacing-lg);
  margin: var(--spacing-lg) 0;
  position: relative;
  overflow: hidden;
}

.visual-metaphor::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
}

.metaphor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.metaphor-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--on-surface);
  margin: 0;
}

.metaphor-emoji {
  font-size: 24px;
}

.metaphor-difficulty {
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius);
  font-size: var(--font-size-xs);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.metaphor-difficulty.beginner { background: var(--success-color); color: white; }
.metaphor-difficulty.intermediate { background: var(--warning-color); color: white; }
.metaphor-difficulty.advanced { background: var(--error-color); color: white; }

.metaphor-content {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: var(--spacing-lg);
  align-items: start;
}

@media (max-width: 768px) {
  .metaphor-content {
    grid-template-columns: 1fr;
  }
}

.metaphor-visual {
  text-align: center;
}

.metaphor-image {
  background: var(--surface-container);
  border-radius: var(--border-radius);
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-md);
}

.metaphor-emoji-large {
  font-size: 64px;
  margin-bottom: var(--spacing-md);
}

.metaphor-label {
  font-size: var(--font-size-md);
  font-weight: 600;
  color: var(--on-surface);
}

.metaphor-animation {
  margin-top: var(--spacing-md);
}

.play-animation {
  background: var(--primary-color);
  color: var(--on-primary);
  border: none;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: var(--transition-fast);
}

.play-animation:hover {
  background: var(--primary-dark);
}

.metaphor-explanation {
  padding: var(--spacing-md);
}

.explanation-text {
  font-size: var(--font-size-md);
  line-height: 1.6;
  color: var(--on-surface);
  margin-bottom: var(--spacing-md);
}

.memory-hook,
.real-world-example {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm);
  background: var(--surface-container);
  border-radius: var(--border-radius);
  margin-bottom: var(--spacing-sm);
  font-size: var(--font-size-sm);
}

.hook-icon,
.example-icon {
  font-size: 18px;
  flex-shrink: 0;
}

.metaphor-diagram {
  grid-column: 1 / -1;
  margin-top: var(--spacing-lg);
}

.metaphor-diagram h5 {
  font-size: var(--font-size-md);
  font-weight: 600;
  color: var(--on-surface);
  margin: 0 0 var(--spacing-md) 0;
}

.diagram-container {
  background: var(--surface-container);
  border-radius: var(--border-radius);
  padding: var(--spacing-md);
  overflow-x: auto;
}

.diagram-container pre {
  margin: 0;
  font-family: var(--font-family-mono);
  font-size: var(--font-size-sm);
  line-height: 1.4;
}

.metaphor-actions {
  display: flex;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-lg);
  flex-wrap: wrap;
}

.action-btn {
  background: var(--surface-container);
  border: 1px solid var(--border-color);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: var(--transition-fast);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.action-btn:hover {
  background: var(--primary-color);
  color: var(--on-primary);
  border-color: var(--primary-color);
}

/* ===== FOOTER E CONTROLES ===== */
.playground-footer {
  background: var(--surface-container-high);
  padding: var(--spacing-md) var(--spacing-lg);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--spacing-md);
  border-top: 1px solid var(--border-color);
}

.execution-stats {
  display: flex;
  gap: var(--spacing-lg);
  flex-wrap: wrap;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: var(--font-size-sm);
}

.stat .label {
  color: var(--on-surface-variant);
  font-size: var(--font-size-xs);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat .value {
  font-weight: 600;
  color: var(--on-surface);
}

.tips {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--font-size-sm);
  color: var(--on-surface-variant);
}

.tip-icon {
  font-size: 18px;
}

/* ===== AÇÕES FLUTUANTES ===== */
.floating-actions {
  position: fixed;
  bottom: var(--spacing-lg);
  right: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  z-index: 1000;
}

.fab-action {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--primary-color);
  color: var(--on-primary);
  border: none;
  cursor: pointer;
  box-shadow: var(--shadow-2);
  transition: var(--transition-normal);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.fab-action:hover {
  background: var(--primary-dark);
  transform: scale(1.1);
  box-shadow: var(--shadow-3);
}

/* ===== RASTREADOR DE PROGRESSO ===== */
.progress-tracker {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--surface-color);
  border-top: 1px solid var(--border-color);
  padding: var(--spacing-sm) var(--spacing-lg);
  z-index: 999;
}

.progress-bar {
  width: 100%;
  height: 4px;
  background: var(--surface-container);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: var(--spacing-xs);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
  transition: width var(--transition-slow);
}

.progress-label {
  font-size: var(--font-size-xs);
  color: var(--on-surface-variant);
  text-align: center;
}

/* ===== RESPONSIVIDADE ===== */
@media (max-width: 768px) {
  .devmentor-rich-explanation {
    margin: var(--spacing-md) 0;
  }
  
  .explanation-hero {
    padding: var(--spacing-lg);
  }
  
  .hero-title {
    font-size: var(--font-size-lg);
  }
  
  .hero-meta {
    flex-direction: column;
    align-items: center;
  }
  
  .nav-tabs {
    flex-direction: column;
  }
  
  .nav-tab {
    justify-content: center;
  }
  
  .section-panel {
    padding: var(--spacing-lg);
  }
  
  .citations-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .playground-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .playground-controls {
    justify-content: center;
  }
  
  .playground-footer {
    flex-direction: column;
    align-items: stretch;
  }
  
  .execution-stats {
    justify-content: center;
  }
  
  .floating-actions {
    bottom: var(--spacing-md);
    right: var(--spacing-md);
  }
  
  .fab-action {
    width: 48px;
    height: 48px;
    font-size: 18px;
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: var(--font-size-md);
  }
  
  .section-panel {
    padding: var(--spacing-md);
  }
  
  .devmentor-citations {
    padding: var(--spacing-md);
  }
  
  .visual-metaphor {
    padding: var(--spacing-md);
  }
  
  .metaphor-content {
    gap: var(--spacing-md);
  }
  
  .metaphor-emoji-large {
    font-size: 48px;
  }
}

/* ===== ANIMAÇÕES ESPECIAIS ===== */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes slideInUp {
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes slideInLeft {
  from {
    transform: translateX(-30px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideInRight {
  from {
    transform: translateX(30px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes scaleIn {
  from {
    transform: scale(0.8);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes rotateIn {
  from {
    transform: rotate(-180deg);
    opacity: 0;
  }
  to {
    transform: rotate(0deg);
    opacity: 1;
  }
}

/* Aplicar animações aos elementos */
.citation-card {
  animation: slideInLeft 0.5s ease;
}

.visual-metaphor {
  animation: slideInUp 0.6s ease;
}

.nav-tab {
  animation: scaleIn 0.3s ease;
}

.fab-action {
  animation: slideInRight 0.4s ease;
}

/* ===== ESTADOS DE CARREGAMENTO ===== */
.loading {
  position: relative;
  overflow: hidden;
}

.loading::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% { left: -100%; }
  100% { left: 100%; }
}

/* ===== MELHORIAS DE ACESSIBILIDADE ===== */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

@media (prefers-color-scheme: dark) {
  :root {
    --surface-color: #121212;
    --surface-variant: #1e1e1e;
    --surface-container: #2d2d2d;
    --surface-container-high: #3d3d3d;
    --on-surface: #ffffff;
    --on-surface-variant: #b3b3b3;
    --border-color: #404040;
  }
}

/* ===== UTILITÁRIOS ===== */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.text-center { text-align: center; }
.text-left { text-align: left; }
.text-right { text-align: right; }

.mb-0 { margin-bottom: 0; }
.mb-1 { margin-bottom: var(--spacing-xs); }
.mb-2 { margin-bottom: var(--spacing-sm); }
.mb-3 { margin-bottom: var(--spacing-md); }
.mb-4 { margin-bottom: var(--spacing-lg); }
.mb-5 { margin-bottom: var(--spacing-xl); }

.mt-0 { margin-top: 0; }
.mt-1 { margin-top: var(--spacing-xs); }
.mt-2 { margin-top: var(--spacing-sm); }
.mt-3 { margin-top: var(--spacing-md); }
.mt-4 { margin-top: var(--spacing-lg); }
.mt-5 { margin-top: var(--spacing-xl); }

.p-0 { padding: 0; }
.p-1 { padding: var(--spacing-xs); }
.p-2 { padding: var(--spacing-sm); }
.p-3 { padding: var(--spacing-md); }
.p-4 { padding: var(--spacing-lg); }
.p-5 { padding: var(--spacing-xl); }
`;

// Função para injetar estilos
function injectMediaRichStyles() {
  if (window.DevMentorHelpers) {
    window.DevMentorHelpers.injectCSS(MEDIA_RICH_STYLES, 'devmentor-media-rich-styles');
  } else {
    // Fallback se DevMentorHelpers não estiver disponível
    const style = document.createElement('style');
    style.id = 'devmentor-media-rich-styles';
    style.textContent = MEDIA_RICH_STYLES;
    document.head.appendChild(style);
  }
}

// Exportar para uso global
window.MEDIA_RICH_STYLES = MEDIA_RICH_STYLES;
window.injectMediaRichStyles = injectMediaRichStyles;

// Auto-injetar estilos quando o script carrega
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', injectMediaRichStyles);
} else {
  injectMediaRichStyles();
}





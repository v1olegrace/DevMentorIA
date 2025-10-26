/**
 * DevMentor AI - Premium UI Manager
 * Interface para recursos premium e monetização
 */

class PremiumUIManager {
  constructor() {
    this.currentPlan = 'free';
    this.features = new Map();
    this.mediaRichExplainer = new MediaRichExplainer();
    this.initializeFeatures();
  }

  /**
   * Renderiza explicação premium com mídia rica
   */
  async renderPremiumExplanation(code, concept, container) {
    const premiumContainer = this.createPremiumContainer();
    
    // Header premium
    const header = this.createPremiumHeader(concept);
    premiumContainer.appendChild(header);

    // Vídeo explicativo (se premium)
    if (this.isPremiumFeature('video_explanations')) {
      const videoSection = await this.createVideoSection(code, concept);
      premiumContainer.appendChild(videoSection);
    } else {
      const upgradePrompt = this.createUpgradePrompt('video_explanations');
      premiumContainer.appendChild(upgradePrompt);
    }

    // Diagrama interativo
    if (this.isPremiumFeature('interactive_diagrams')) {
      const diagramSection = await this.createDiagramSection(code);
      premiumContainer.appendChild(diagramSection);
    } else {
      const upgradePrompt = this.createUpgradePrompt('interactive_diagrams');
      premiumContainer.appendChild(upgradePrompt);
    }

    // Citações acadêmicas
    if (this.isPremiumFeature('academic_citations')) {
      const citationsSection = await this.createCitationsSection(concept);
      premiumContainer.appendChild(citationsSection);
    } else {
      const upgradePrompt = this.createUpgradePrompt('academic_citations');
      premiumContainer.appendChild(upgradePrompt);
    }

    // Métricas de aprendizado
    if (this.isPremiumFeature('learning_metrics')) {
      const metricsSection = await this.createMetricsSection();
      premiumContainer.appendChild(metricsSection);
    }

    container.appendChild(premiumContainer);
    this.addPremiumAnimations(premiumContainer);
  }

  /**
   * Cria container premium com estilo diferenciado
   */
  createPremiumContainer() {
    const container = document.createElement('div');
    container.className = 'devmentor-premium-container devmentor-fade-in';
    return container;
  }

  /**
   * Cria header premium com badge
   */
  createPremiumHeader(concept) {
    const header = document.createElement('div');
    header.className = 'devmentor-premium-header';
    
    const badge = document.createElement('span');
    badge.className = 'devmentor-premium-badge';
    badge.textContent = this.currentPlan === 'free' ? 'Premium' : 'Pro';
    
    const title = document.createElement('h3');
    title.className = 'devmentor-premium-title';
    title.textContent = `Explicação Avançada: ${concept}`;
    
    header.appendChild(badge);
    header.appendChild(title);
    
    return header;
  }

  /**
   * Cria seção de vídeo explicativo
   */
  async createVideoSection(code, concept) {
    const section = document.createElement('div');
    section.className = 'devmentor-video-section';
    
    const videoPlayer = document.createElement('div');
    videoPlayer.className = 'devmentor-video-player';
    
    // Thumbnail do vídeo
    const thumbnail = document.createElement('div');
    thumbnail.className = 'devmentor-video-thumbnail';
    thumbnail.textContent = `Vídeo Explicativo: ${concept}`;
    
    // Botão de play
    const playButton = document.createElement('div');
    playButton.className = 'devmentor-play-button';
    
    const playIcon = document.createElement('div');
    playIcon.className = 'devmentor-play-icon';
    playButton.appendChild(playIcon);
    
    videoPlayer.appendChild(thumbnail);
    videoPlayer.appendChild(playButton);
    
    // Evento de clique para gerar vídeo
    playButton.addEventListener('click', async () => {
      await this.generateAndPlayVideo(code, concept, videoPlayer);
    });
    
    section.appendChild(videoPlayer);
    return section;
  }

  /**
   * Cria seção de diagrama interativo
   */
  async createDiagramSection(code) {
    const section = document.createElement('div');
    section.className = 'devmentor-diagram-container';
    
    // Controles do diagrama
    const controls = document.createElement('div');
    controls.className = 'devmentor-diagram-controls';
    
    const types = ['Fluxograma', 'Arquitetura', 'Sequência', 'Classes'];
    types.forEach(type => {
      const btn = document.createElement('button');
      btn.className = 'devmentor-diagram-btn';
      btn.textContent = type;
      btn.addEventListener('click', () => this.generateDiagram(code, type.toLowerCase(), canvas));
      controls.appendChild(btn);
    });
    
    // Canvas do diagrama
    const canvas = document.createElement('div');
    canvas.className = 'devmentor-diagram-canvas';
    
    section.appendChild(controls);
    section.appendChild(canvas);
    
    // Gerar diagrama inicial
    await this.generateDiagram(code, 'flowchart', canvas);
    
    return section;
  }

  /**
   * Cria seção de citações acadêmicas
   */
  async createCitationsSection(concept) {
    const section = document.createElement('div');
    section.className = 'devmentor-citations';
    
    const title = document.createElement('h4');
    title.className = 'devmentor-citations-title';
    title.innerHTML = '📚 Fontes Acadêmicas e Referências';
    
    section.appendChild(title);
    
    // Buscar citações relevantes
    const citations = await this.mediaRichExplainer.generateCitations(concept);
    
    // Renderizar citações acadêmicas
    if (citations.academicPapers) {
      citations.academicPapers.forEach(paper => {
        const citationItem = this.createCitationItem(paper, 'academic');
        section.appendChild(citationItem);
      });
    }
    
    // Renderizar documentação oficial
    if (citations.documentationLinks) {
      citations.documentationLinks.forEach(doc => {
        const citationItem = this.createCitationItem(doc, 'documentation');
        section.appendChild(citationItem);
      });
    }
    
    return section;
  }

  /**
   * Cria item de citação individual
   */
  createCitationItem(citation, type) {
    const item = document.createElement('div');
    item.className = 'devmentor-citation-item devmentor-slide-in';
    
    const title = document.createElement('div');
    title.className = 'devmentor-citation-title';
    title.textContent = citation.title;
    
    const authors = document.createElement('div');
    authors.className = 'devmentor-citation-authors';
    authors.textContent = citation.authors ? citation.authors.join(', ') : citation.source;
    
    const meta = document.createElement('div');
    meta.className = 'devmentor-citation-meta';
    
    if (type === 'academic') {
      meta.innerHTML = `
        <span>📖 ${citation.journal || 'Journal'}</span>
        <span>📅 ${citation.year || 'Recent'}</span>
        <span>⭐ Relevância: ${Math.round((citation.relevanceScore || 0.8) * 100)}%</span>
      `;
    } else {
      meta.innerHTML = `
        <span>🌐 Documentação Oficial</span>
        <span>🔄 Atualizado: ${citation.lastUpdated || 'Recente'}</span>
      `;
    }
    
    const link = document.createElement('a');
    link.className = 'devmentor-citation-link';
    link.href = citation.url || '#';
    link.target = '_blank';
    link.textContent = 'Ver fonte completa →';
    
    item.appendChild(title);
    item.appendChild(authors);
    item.appendChild(meta);
    item.appendChild(link);
    
    return item;
  }

  /**
   * Cria seção de métricas de aprendizado
   */
  async createMetricsSection() {
    const section = document.createElement('div');
    section.className = 'devmentor-metrics-section';
    
    const title = document.createElement('h4');
    title.textContent = '📊 Seu Progresso de Aprendizado';
    section.appendChild(title);
    
    // Grid de métricas
    const metricsGrid = document.createElement('div');
    metricsGrid.className = 'devmentor-metrics-grid';
    
    const metrics = [
      { label: 'Conceitos Aprendidos', value: '47', change: '+3 esta semana', positive: true },
      { label: 'Taxa de Retenção', value: '89%', change: '+5% vs mês passado', positive: true },
      { label: 'Tempo de Estudo', value: '12h', change: '2h esta semana', positive: true },
      { label: 'Nível Atual', value: 'Intermediário', change: 'Próximo: Avançado', positive: true }
    ];
    
    metrics.forEach(metric => {
      const card = this.createMetricCard(metric);
      metricsGrid.appendChild(card);
    });
    
    // Barra de progresso
    const progressContainer = document.createElement('div');
    progressContainer.className = 'devmentor-progress-container';
    
    const progressHeader = document.createElement('div');
    progressHeader.className = 'devmentor-progress-header';
    
    const progressTitle = document.createElement('span');
    progressTitle.className = 'devmentor-progress-title';
    progressTitle.textContent = 'Progresso para Nível Avançado';
    
    const progressPercentage = document.createElement('span');
    progressPercentage.className = 'devmentor-progress-percentage';
    progressPercentage.textContent = '67%';
    
    progressHeader.appendChild(progressTitle);
    progressHeader.appendChild(progressPercentage);
    
    const progressBar = document.createElement('div');
    progressBar.className = 'devmentor-progress-bar';
    
    const progressFill = document.createElement('div');
    progressFill.className = 'devmentor-progress-fill';
    progressFill.style.width = '67%';
    
    progressBar.appendChild(progressFill);
    progressContainer.appendChild(progressHeader);
    progressContainer.appendChild(progressBar);
    
    section.appendChild(metricsGrid);
    section.appendChild(progressContainer);
    
    return section;
  }

  /**
   * Cria card de métrica individual
   */
  createMetricCard(metric) {
    const card = document.createElement('div');
    card.className = 'devmentor-metric-card';
    
    const value = document.createElement('div');
    value.className = 'devmentor-metric-value';
    value.textContent = metric.value;
    
    const label = document.createElement('div');
    label.className = 'devmentor-metric-label';
    label.textContent = metric.label;
    
    const change = document.createElement('div');
    change.className = `devmentor-metric-change ${metric.positive ? 'positive' : 'negative'}`;
    change.textContent = metric.change;
    
    card.appendChild(value);
    card.appendChild(label);
    card.appendChild(change);
    
    return card;
  }

  /**
   * Cria prompt de upgrade para recursos premium
   */
  createUpgradePrompt(featureName) {
    const section = document.createElement('div');
    section.className = 'devmentor-upgrade-section';
    
    const featureNames = {
      video_explanations: 'Vídeos Explicativos com IA',
      interactive_diagrams: 'Diagramas Interativos',
      academic_citations: 'Citações Acadêmicas',
      learning_metrics: 'Métricas de Aprendizado'
    };
    
    const title = document.createElement('h4');
    title.textContent = `🔒 ${featureNames[featureName]}`;
    
    const description = document.createElement('p');
    description.textContent = this.getFeatureDescription(featureName);
    
    const upgradeBtn = document.createElement('button');
    upgradeBtn.className = 'devmentor-upgrade-btn';
    upgradeBtn.textContent = 'Upgrade para Pro';
    upgradeBtn.addEventListener('click', () => this.showUpgradeModal(featureName));
    
    section.appendChild(title);
    section.appendChild(description);
    section.appendChild(upgradeBtn);
    
    return section;
  }

  /**
   * Gera e reproduz vídeo explicativo
   */
  async generateAndPlayVideo(code, concept, container) {
    // Mostrar loading
    container.innerHTML = '<div class="devmentor-loading">Gerando vídeo explicativo...</div>';
    
    try {
      const videoData = await this.mediaRichExplainer.generateExplanationVideo(code, concept);
      
      // Simular player de vídeo
      container.innerHTML = `
        <div class="devmentor-video-content">
          <h5>🎬 ${concept} - Explicação Visual</h5>
          <div class="devmentor-video-script">
            <strong>Roteiro do Vídeo:</strong>
            <p>${videoData.script.substring(0, 200)}...</p>
          </div>
          <div class="devmentor-video-slides">
            <strong>Slides Principais:</strong>
            <ul>
              <li>Introdução ao conceito</li>
              <li>Demonstração prática</li>
              <li>Melhores práticas</li>
              <li>Próximos passos</li>
            </ul>
          </div>
        </div>
      `;
    } catch (error) {
      container.innerHTML = '<div class="devmentor-error">Erro ao gerar vídeo. Tente novamente.</div>';
    }
  }

  /**
   * Gera diagrama interativo
   */
  async generateDiagram(code, type, container) {
    container.innerHTML = '<div class="devmentor-loading">Gerando diagrama...</div>';
    
    try {
      const diagram = await this.mediaRichExplainer.generateInteractiveDiagram(code, type);
      
      // Simular diagrama
      container.innerHTML = `
        <div class="devmentor-diagram-content">
          <h5>📊 Diagrama ${type.charAt(0).toUpperCase() + type.slice(1)}</h5>
          <svg width="100%" height="200" viewBox="0 0 400 200">
            <rect x="50" y="50" width="80" height="40" fill="#667eea" rx="5"/>
            <text x="90" y="75" fill="white" text-anchor="middle" font-size="12">Início</text>
            
            <rect x="170" y="50" width="80" height="40" fill="#764ba2" rx="5"/>
            <text x="210" y="75" fill="white" text-anchor="middle" font-size="12">Processo</text>
            
            <rect x="290" y="50" width="80" height="40" fill="#667eea" rx="5"/>
            <text x="330" y="75" fill="white" text-anchor="middle" font-size="12">Fim</text>
            
            <path d="M130 70 L170 70" stroke="#333" marker-end="url(#arrowhead)"/>
            <path d="M250 70 L290 70" stroke="#333" marker-end="url(#arrowhead)"/>
            
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" 
                      refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#333"/>
              </marker>
            </defs>
          </svg>
          <p><em>Diagrama interativo - Clique nos elementos para mais detalhes</em></p>
        </div>
      `;
    } catch (error) {
      container.innerHTML = '<div class="devmentor-error">Erro ao gerar diagrama.</div>';
    }
  }

  /**
   * Verifica se usuário tem acesso a recurso premium
   */
  isPremiumFeature(featureName) {
    const premiumFeatures = {
      free: [],
      pro: ['video_explanations', 'interactive_diagrams', 'academic_citations'],
      enterprise: ['video_explanations', 'interactive_diagrams', 'academic_citations', 'learning_metrics', 'collaboration'],
      education: ['video_explanations', 'interactive_diagrams', 'academic_citations', 'learning_metrics', 'collaboration', 'curriculum']
    };
    
    return premiumFeatures[this.currentPlan]?.includes(featureName) || false;
  }

  /**
   * Obtém descrição do recurso
   */
  getFeatureDescription(featureName) {
    const descriptions = {
      video_explanations: 'Vídeos personalizados gerados por IA que explicam conceitos complexos de forma visual e interativa.',
      interactive_diagrams: 'Diagramas dinâmicos que mostram fluxo de dados, arquitetura e relacionamentos no código.',
      academic_citations: 'Referências acadêmicas confiáveis e links para aprofundamento em cada conceito.',
      learning_metrics: 'Acompanhe seu progresso com métricas detalhadas e sugestões personalizadas.'
    };
    
    return descriptions[featureName] || 'Recurso premium exclusivo.';
  }

  /**
   * Mostra modal de upgrade
   */
  showUpgradeModal(featureName) {
    // Implementar modal de upgrade com planos de preços
    console.log(`Upgrade modal for ${featureName}`);
    
    // Exemplo básico
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
    `;
    
    modal.innerHTML = `
      <div style="background: white; padding: 30px; border-radius: 12px; max-width: 400px; text-align: center;">
        <h3>🚀 Upgrade para DevMentor AI Pro</h3>
        <p>Desbloqueie ${this.getFeatureDescription(featureName)}</p>
        <div style="margin: 20px 0;">
          <strong>$9.99/mês</strong>
        </div>
        <button onclick="this.parentElement.parentElement.remove()" 
                style="background: #667eea; color: white; border: none; padding: 10px 20px; border-radius: 6px; margin: 5px;">
          Fazer Upgrade
        </button>
        <button onclick="this.parentElement.parentElement.remove()" 
                style="background: #ccc; color: #333; border: none; padding: 10px 20px; border-radius: 6px; margin: 5px;">
          Talvez Depois
        </button>
      </div>
    `;
    
    document.body.appendChild(modal);
  }

  /**
   * Adiciona animações aos elementos premium
   */
  addPremiumAnimations(container) {
    // Animação de entrada escalonada
    const elements = container.querySelectorAll('.devmentor-citation-item, .devmentor-metric-card');
    elements.forEach((el, index) => {
      setTimeout(() => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'all 0.5s ease';
        
        setTimeout(() => {
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
        }, 50);
      }, index * 100);
    });
  }

  /**
   * Inicializa recursos disponíveis por plano
   */
  initializeFeatures() {
    this.features.set('free', {
      explanations: 10,
      screenshots: 5,
      cache: true,
      basicAnalysis: true
    });
    
    this.features.set('pro', {
      explanations: 'unlimited',
      screenshots: 'unlimited',
      cache: true,
      basicAnalysis: true,
      videoExplanations: true,
      interactiveDiagrams: true,
      academicCitations: true,
      prioritySupport: true
    });
    
    this.features.set('enterprise', {
      ...this.features.get('pro'),
      learningMetrics: true,
      collaboration: true,
      customIntegrations: true,
      analytics: true
    });
  }
}

// Exportar para uso global
window.PremiumUIManager = PremiumUIManager;

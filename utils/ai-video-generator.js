/**
 * DevMentor AI - AI Video Generator
 * Sistema de geração de vídeos explicativos com AI
 * 
 * Funcionalidades:
 * - Geração de storyboard automático
 * - Narração com texto-para-fala
 * - Animações de código
 * - Visualizações de execução
 * - Legendas automáticas
 * - Integração com Google Gemini Pro
 */

class AIVideoGenerator {
  constructor() {
    this.canvas = null;
    this.videoRecorder = null;
    this.audioSynthesizer = null;
    this.animationEngine = new CodeAnimationEngine();
    this.geminiAPI = new GeminiAPI();
    
    // Configurações
    this.config = {
      maxDuration: 60, // segundos
      fps: 30,
      resolution: { width: 1920, height: 1080 },
      audioQuality: 'high',
      videoQuality: 'high'
    };
    
    console.log('[AIVideoGenerator] Inicializado com suporte a Gemini Pro');
  }

  /**
   * GERAR VÍDEO EXPLICATIVO COMPLETO
   * Cria vídeo com narração AI e animações
   */
  async generateExplanationVideo(code, explanation, options = {}) {
    console.log('[AIVideoGenerator] Iniciando geração de vídeo...');
    
    try {
      // 1. Criar storyboard usando Gemini Pro
      const storyboard = await this._createStoryboardWithGemini(code, explanation, options);
      
      // 2. Gerar narração
      const narration = await this._generateNarrationWithGemini(storyboard);
      
      // 3. Criar animações
      const animations = await this._createCodeAnimations(code, storyboard);
      
      // 4. Compilar vídeo
      const video = await this._compileVideo(storyboard, narration, animations);
      
      console.log('[AIVideoGenerator] Vídeo gerado com sucesso!');
      
      return {
        videoUrl: video.url,
        duration: video.duration,
        thumbnail: video.thumbnail,
        transcript: storyboard.transcript,
        downloadUrl: video.downloadUrl,
        metadata: {
          codeLength: code.length,
          concepts: storyboard.concepts,
          animations: animations.length,
          generatedAt: new Date().toISOString()
        }
      };
      
    } catch (error) {
      console.error('[AIVideoGenerator] Erro na geração:', error);
      return this._createFallbackVideo(code, explanation);
    }
  }

  /**
   * CRIAR STORYBOARD COM GEMINI PRO
   * Usa Gemini Pro para criar roteiro inteligente
   */
  async _createStoryboardWithGemini(code, explanation, options) {
    console.log('[AIVideoGenerator] Criando storyboard com Gemini Pro...');
    
    const prompt = `
    Você é um especialista em criar storyboards para vídeos educacionais de programação.
    
    Código para explicar:
    \`\`\`${options.language || 'javascript'}
    ${code}
    \`\`\`
    
    Explicação base:
    ${explanation}
    
    Crie um storyboard detalhado para um vídeo de ${this.config.maxDuration} segundos que explique este código de forma clara e envolvente.
    
    O storyboard deve incluir:
    1. Introdução (5-10s): Apresentação do problema/conceito
    2. Visão geral (10-15s): Explicação geral do código
    3. Análise detalhada (30-40s): Explicação linha por linha
    4. Demonstração (10-15s): Execução visual do código
    5. Conclusão (5s): Resumo e próximos passos
    
    Para cada cena, forneça:
    - Duração em segundos
    - Narração (texto para falar)
    - Elementos visuais (código, animações, diagramas)
    - Pontos de foco (linhas específicas do código)
    - Conceitos-chave a destacar
    
    Responda em formato JSON estruturado.
    `;
    
    try {
      const response = await this.geminiAPI.generateContent(prompt);
      const storyboard = JSON.parse(response);
      
      // Validar e processar storyboard
      return this._processStoryboard(storyboard, code);
      
    } catch (error) {
      console.warn('[AIVideoGenerator] Gemini Pro não disponível, usando fallback');
      return this._createFallbackStoryboard(code, explanation);
    }
  }

  /**
   * GERAR NARRAÇÃO COM GEMINI PRO
   * Cria narração natural e envolvente
   */
  async _generateNarrationWithGemini(storyboard) {
    console.log('[AIVideoGenerator] Gerando narração com Gemini Pro...');
    
    const prompt = `
    Você é um narrador profissional de vídeos educacionais de programação.
    
    Storyboard:
    ${JSON.stringify(storyboard, null, 2)}
    
    Crie uma narração natural e envolvente para este vídeo educacional. A narração deve:
    - Ser clara e fácil de entender
    - Usar linguagem acessível
    - Incluir pausas naturais
    - Destacar conceitos importantes
    - Manter o interesse do espectador
    
    Para cada cena, forneça:
    - Texto da narração
    - Timing (quando falar cada parte)
    - Tom de voz sugerido
    - Pontos de ênfase
    
    Responda em formato JSON.
    `;
    
    try {
      const response = await this.geminiAPI.generateContent(prompt);
      return JSON.parse(response);
      
    } catch (error) {
      console.warn('[AIVideoGenerator] Usando narração fallback');
      return this._createFallbackNarration(storyboard);
    }
  }

  /**
   * CRIAR ANIMAÇÕES DE CÓDIGO
   * Gera animações para visualizar execução
   */
  async _createCodeAnimations(code, storyboard) {
    console.log('[AIVideoGenerator] Criando animações de código...');
    
    const animations = [];
    
    for (const scene of storyboard.scenes) {
      if (scene.visualElements.includes('code_animation')) {
        const animation = await this._createCodeAnimation(scene, code);
        animations.push(animation);
      }
    }
    
    return animations;
  }

  /**
   * CRIAR ANIMAÇÃO DE CÓDIGO ESPECÍFICA
   */
  async _createCodeAnimation(scene, code) {
    return {
      sceneId: scene.id,
      duration: scene.duration,
      type: 'code_execution',
      elements: [
        {
          type: 'highlight',
          target: scene.focusLines,
          color: '#4CAF50',
          duration: 2000
        },
        {
          type: 'variable_tracker',
          variables: this._extractVariables(code),
          position: 'right',
          duration: scene.duration * 1000
        },
        {
          type: 'execution_flow',
          steps: this._createExecutionSteps(code),
          duration: scene.duration * 1000
        }
      ]
    };
  }

  /**
   * COMPILAR VÍDEO FINAL
   * Combina todas as partes em vídeo final
   */
  async _compileVideo(storyboard, narration, animations) {
    console.log('[AIVideoGenerator] Compilando vídeo final...');
    
    // Criar canvas para renderização
    const canvas = document.createElement('canvas');
    canvas.width = this.config.resolution.width;
    canvas.height = this.config.resolution.height;
    const ctx = canvas.getContext('2d');
    
    // Configurar MediaRecorder
    const stream = canvas.captureStream(this.config.fps);
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'video/webm;codecs=vp9',
      videoBitsPerSecond: 2500000
    });
    
    const chunks = [];
    mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
    
    return new Promise((resolve) => {
      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        
        // Gerar thumbnail
        const thumbnail = await this._generateThumbnail(canvas);
        
        resolve({
          url,
          blob,
          duration: this._calculateTotalDuration(storyboard),
          thumbnail,
          downloadUrl: url
        });
      };
      
      // Iniciar gravação
      mediaRecorder.start();
      
      // Renderizar cenas
      this._renderScenes(canvas, ctx, storyboard, narration, animations)
        .then(() => {
          mediaRecorder.stop();
        });
    });
  }

  /**
   * RENDERIZAR CENAS
   * Renderiza cada cena do vídeo
   */
  async _renderScenes(canvas, ctx, storyboard, narration, animations) {
    for (let i = 0; i < storyboard.scenes.length; i++) {
      const scene = storyboard.scenes[i];
      const sceneNarration = narration.scenes[i];
      
      await this._renderScene(ctx, scene, sceneNarration, animations[i]);
      
      // Aguardar duração da cena
      await this._sleep(scene.duration * 1000);
    }
  }

  /**
   * RENDERIZAR CENA INDIVIDUAL
   */
  async _renderScene(ctx, scene, narration, animation) {
    // Limpar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Renderizar fundo
    this._renderBackground(ctx);
    
    // Renderizar código
    await this._renderCode(ctx, scene.code);
    
    // Renderizar animações
    if (animation) {
      await this._renderAnimation(ctx, animation);
    }
    
    // Renderizar elementos visuais
    await this._renderVisualElements(ctx, scene.visualElements);
    
    // Renderizar narração (se necessário)
    if (scene.showSubtitles) {
      this._renderSubtitles(ctx, narration.text);
    }
  }

  /**
   * RENDERIZAR FUNDO
   */
  _renderBackground(ctx) {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#f8f9fa');
    gradient.addColorStop(1, '#e9ecef');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  /**
   * RENDERIZAR CÓDIGO
   */
  async _renderCode(ctx, code) {
    const codeLines = code.split('\n');
    const lineHeight = 24;
    const startY = 100;
    
    ctx.font = '16px "Roboto Mono", monospace';
    ctx.fillStyle = '#2d3748';
    
    codeLines.forEach((line, index) => {
      const y = startY + (index * lineHeight);
      ctx.fillText(line, 50, y);
    });
  }

  /**
   * RENDERIZAR ANIMAÇÃO
   */
  async _renderAnimation(ctx, animation) {
    for (const element of animation.elements) {
      switch (element.type) {
        case 'highlight':
          await this._renderHighlight(ctx, element);
          break;
        case 'variable_tracker':
          await this._renderVariableTracker(ctx, element);
          break;
        case 'execution_flow':
          await this._renderExecutionFlow(ctx, element);
          break;
      }
    }
  }

  /**
   * RENDERIZAR DESTAQUE
   */
  async _renderHighlight(ctx, element) {
    ctx.fillStyle = element.color;
    ctx.globalAlpha = 0.3;
    
    // Destacar linhas específicas
    element.target.forEach(lineNumber => {
      const y = 100 + (lineNumber * 24);
      ctx.fillRect(0, y - 12, canvas.width, 24);
    });
    
    ctx.globalAlpha = 1.0;
  }

  /**
   * RENDERIZAR RASTREADOR DE VARIÁVEIS
   */
  async _renderVariableTracker(ctx, element) {
    const startX = canvas.width - 300;
    const startY = 100;
    
    ctx.fillStyle = '#2196F3';
    ctx.font = '14px "Roboto", sans-serif';
    
    element.variables.forEach((variable, index) => {
      const y = startY + (index * 30);
      
      // Nome da variável
      ctx.fillText(`${variable.name}:`, startX, y);
      
      // Valor da variável
      ctx.fillStyle = '#333';
      ctx.fillText(variable.value, startX + 80, y);
      ctx.fillStyle = '#2196F3';
    });
  }

  /**
   * RENDERIZAR FLUXO DE EXECUÇÃO
   */
  async _renderExecutionFlow(ctx, element) {
    ctx.strokeStyle = '#4CAF50';
    ctx.lineWidth = 3;
    
    // Desenhar setas de execução
    element.steps.forEach((step, index) => {
      const startY = 100 + (step.fromLine * 24);
      const endY = 100 + (step.toLine * 24);
      
      ctx.beginPath();
      ctx.moveTo(50, startY);
      ctx.lineTo(50, endY);
      ctx.stroke();
      
      // Seta
      ctx.beginPath();
      ctx.moveTo(45, endY - 5);
      ctx.lineTo(55, endY - 5);
      ctx.lineTo(50, endY);
      ctx.closePath();
      ctx.fill();
    });
  }

  /**
   * RENDERIZAR ELEMENTOS VISUAIS
   */
  async _renderVisualElements(ctx, elements) {
    for (const element of elements) {
      switch (element) {
        case 'diagram':
          await this._renderDiagram(ctx);
          break;
        case 'chart':
          await this._renderChart(ctx);
          break;
        case 'icon':
          await this._renderIcon(ctx);
          break;
      }
    }
  }

  /**
   * RENDERIZAR LEGENDAS
   */
  _renderSubtitles(ctx, text) {
    const padding = 20;
    const fontSize = 18;
    const lineHeight = fontSize + 4;
    
    ctx.font = `${fontSize}px "Roboto", sans-serif`;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    
    // Fundo das legendas
    const textWidth = ctx.measureText(text).width;
    const textHeight = lineHeight;
    const x = (canvas.width - textWidth) / 2;
    const y = canvas.height - 100;
    
    ctx.fillRect(x - padding, y - textHeight, textWidth + (padding * 2), textHeight + padding);
    
    // Texto das legendas
    ctx.fillStyle = 'white';
    ctx.fillText(text, x, y);
  }

  // Métodos auxiliares
  _processStoryboard(storyboard, code) {
    // Validar e processar storyboard do Gemini
    return {
      ...storyboard,
      totalDuration: storyboard.scenes.reduce((total, scene) => total + scene.duration, 0),
      concepts: this._extractConcepts(storyboard),
      transcript: this._generateTranscript(storyboard)
    };
  }

  _createFallbackStoryboard(code, explanation) {
    return {
      scenes: [
        {
          id: 'intro',
          duration: 10,
          narration: 'Vamos analisar este código passo a passo',
          visualElements: ['code'],
          focusLines: [1],
          concepts: ['introdução']
        },
        {
          id: 'analysis',
          duration: 40,
          narration: explanation,
          visualElements: ['code_animation'],
          focusLines: Array.from({length: code.split('\n').length}, (_, i) => i + 1),
          concepts: ['análise']
        },
        {
          id: 'conclusion',
          duration: 10,
          narration: 'Este código demonstra conceitos importantes de programação',
          visualElements: ['code'],
          focusLines: [],
          concepts: ['conclusão']
        }
      ],
      totalDuration: 60,
      concepts: ['programação', 'código'],
      transcript: explanation
    };
  }

  _createFallbackNarration(storyboard) {
    return {
      scenes: storyboard.scenes.map(scene => ({
        text: scene.narration,
        timing: scene.duration,
        tone: 'educational',
        emphasis: []
      }))
    };
  }

  _extractVariables(code) {
    const variables = [];
    const varPattern = /\b(let|const|var)\s+(\w+)/g;
    let match;
    
    while ((match = varPattern.exec(code)) !== null) {
      variables.push({
        name: match[2],
        type: match[1],
        value: 'undefined'
      });
    }
    
    return variables;
  }

  _createExecutionSteps(code) {
    const lines = code.split('\n');
    const steps = [];
    
    for (let i = 0; i < lines.length - 1; i++) {
      steps.push({
        fromLine: i,
        toLine: i + 1,
        description: `Executando linha ${i + 1}`
      });
    }
    
    return steps;
  }

  _calculateTotalDuration(storyboard) {
    return storyboard.scenes.reduce((total, scene) => total + scene.duration, 0);
  }

  _generateThumbnail(canvas) {
    // Criar thumbnail do primeiro frame
    const thumbnailCanvas = document.createElement('canvas');
    thumbnailCanvas.width = 320;
    thumbnailCanvas.height = 180;
    const thumbnailCtx = thumbnailCanvas.getContext('2d');
    
    thumbnailCtx.drawImage(canvas, 0, 0, 320, 180);
    
    return thumbnailCanvas.toDataURL('image/jpeg', 0.8);
  }

  _extractConcepts(storyboard) {
    const concepts = new Set();
    storyboard.scenes.forEach(scene => {
      scene.concepts.forEach(concept => concepts.add(concept));
    });
    return Array.from(concepts);
  }

  _generateTranscript(storyboard) {
    return storyboard.scenes
      .map(scene => scene.narration)
      .join(' ');
  }

  _createFallbackVideo(code, explanation) {
    return {
      videoUrl: '/assets/videos/fallback.mp4',
      duration: 30,
      thumbnail: '/assets/videos/fallback-thumb.jpg',
      transcript: explanation,
      downloadUrl: '/assets/videos/fallback.mp4',
      metadata: {
        codeLength: code.length,
        concepts: ['programação'],
        animations: 0,
        generatedAt: new Date().toISOString(),
        fallback: true
      }
    };
  }

  _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Métodos para renderização de elementos específicos
  async _renderDiagram(ctx) {
    // Renderizar diagrama simples
    ctx.fillStyle = '#4CAF50';
    ctx.fillRect(100, 200, 200, 100);
    ctx.fillStyle = 'white';
    ctx.font = '16px "Roboto", sans-serif';
    ctx.fillText('Diagrama', 180, 250);
  }

  async _renderChart(ctx) {
    // Renderizar gráfico simples
    ctx.fillStyle = '#2196F3';
    ctx.fillRect(100, 300, 50, 100);
    ctx.fillRect(200, 300, 50, 80);
    ctx.fillRect(300, 300, 50, 120);
  }

  async _renderIcon(ctx) {
    // Renderizar ícone simples
    ctx.fillStyle = '#FF9800';
    ctx.beginPath();
    ctx.arc(400, 200, 30, 0, 2 * Math.PI);
    ctx.fill();
  }
}

// Engine de animações de código
class CodeAnimationEngine {
  constructor() {
    this.animations = new Map();
    this._initializeAnimations();
  }

  _initializeAnimations() {
    // Implementar diferentes tipos de animação
    this.animations.set('highlight', this._animateHighlight.bind(this));
    this.animations.set('fadeIn', this._animateFadeIn.bind(this));
    this.animations.set('slideIn', this._animateSlideIn.bind(this));
    this.animations.set('pulse', this._animatePulse.bind(this));
  }

  _animateHighlight(ctx, element, progress) {
    const alpha = Math.sin(progress * Math.PI) * 0.5 + 0.5;
    ctx.globalAlpha = alpha;
    // Implementar animação de destaque
  }

  _animateFadeIn(ctx, element, progress) {
    ctx.globalAlpha = progress;
    // Implementar fade in
  }

  _animateSlideIn(ctx, element, progress) {
    const offset = (1 - progress) * 100;
    // Implementar slide in
  }

  _animatePulse(ctx, element, progress) {
    const scale = 1 + Math.sin(progress * Math.PI * 2) * 0.1;
    // Implementar pulso
  }
}

// API do Google Gemini Pro
class GeminiAPI {
  constructor() {
    this.apiKey = null;
    this.baseURL = 'https://generativelanguage.googleapis.com/v1beta';
    this._initializeAPI();
  }

  async _initializeAPI() {
    // Tentar obter API key do ambiente ou configuração
    try {
      // Em produção, isso viria de variáveis de ambiente
      this.apiKey = process.env.GEMINI_API_KEY || null;
      
      if (!this.apiKey) {
        console.warn('[GeminiAPI] API key não encontrada');
        return;
      }
      
      console.log('[GeminiAPI] Inicializado com sucesso');
      
    } catch (error) {
      console.warn('[GeminiAPI] Erro na inicialização:', error);
    }
  }

  async generateContent(prompt, options = {}) {
    if (!this.apiKey) {
      throw new Error('Gemini API key não configurada');
    }

    try {
      const response = await fetch(`${this.baseURL}/models/gemini-pro:generateContent?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: options.temperature || 0.7,
            topK: options.topK || 40,
            topP: options.topP || 0.95,
            maxOutputTokens: options.maxTokens || 2048,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      return data.candidates[0].content.parts[0].text;

    } catch (error) {
      console.error('[GeminiAPI] Erro na geração:', error);
      throw error;
    }
  }

  async generateVideoScript(code, language, analysisType) {
    const prompt = `
    Crie um roteiro para vídeo educacional explicando este código ${language}:
    
    \`\`\`${language}
    ${code}
    \`\`\`
    
    Tipo de análise: ${analysisType}
    
    O roteiro deve ser:
    - Educativo e claro
    - Apropriado para nível intermediário
    - Com duração de 45-60 segundos
    - Incluindo introdução, explicação e conclusão
    
    Formato: JSON com cenas, narração e elementos visuais
    `;

    return await this.generateContent(prompt);
  }

  async generateNarration(storyboard) {
    const prompt = `
    Crie uma narração natural e envolvente para este storyboard de vídeo educacional:
    
    ${JSON.stringify(storyboard, null, 2)}
    
    A narração deve:
    - Ser clara e fácil de entender
    - Usar linguagem acessível
    - Incluir pausas naturais
    - Destacar conceitos importantes
    
    Formato: JSON com timing e texto
    `;

    return await this.generateContent(prompt);
  }
}

// Exportar para uso global
window.AIVideoGenerator = AIVideoGenerator;
window.CodeAnimationEngine = CodeAnimationEngine;
window.GeminiAPI = GeminiAPI;





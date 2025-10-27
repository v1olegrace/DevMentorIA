/**
 * Enhanced Storytelling Mode Component
 * Learn code through interactive stories with animations
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Book,
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  Sparkles,
  Code,
  Users,
  MapPin
} from 'lucide-react';

interface StoryScene {
  id: string;
  chapter: number;
  scene: number;
  title: string;
  narration: string;
  code?: string;
  explanation: string;
  character?: {
    name: string;
    avatar: string;
    dialogue: string;
  };
  choices?: Array<{
    text: string;
    next: string;
  }>;
}

interface StorytellingModeProps {
  code?: string;
  language?: string;
  onComplete?: () => void;
}

const StorytellingMode: React.FC<StorytellingModeProps> = ({
  code,
  language = 'javascript',
  onComplete
}) => {
  const { t } = useTranslation();
  const [currentScene, setCurrentScene] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [textProgress, setTextProgress] = useState(0);
  const [scenes, setScenes] = useState<StoryScene[]>([]);
  const [loading, setLoading] = useState(true);

  // Animated text reveal effect
  useEffect(() => {
    if (!playing || !scenes[currentScene]) return;

    const narration = scenes[currentScene].narration;
    const duration = narration.length * 30; // 30ms per character
    let progress = 0;

    const interval = setInterval(() => {
      progress += 100 / (duration / 50);
      setTextProgress(Math.min(progress, 100));

      if (progress >= 100) {
        setPlaying(false);
        clearInterval(interval);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [playing, currentScene, scenes]);

  const createBasicStory = useCallback(() => {
    // Create a basic story based on code
    const basicScenes: StoryScene[] = [
      {
        id: '1',
        chapter: 1,
        scene: 1,
        title: 'O Inicio da Jornada',
        narration: 'Era uma vez um desenvolvedor que encontrou um codigo misterioso...',
        code,
        explanation: 'Este codigo representa o inicio de sua jornada de aprendizado.',
        character: {
          name: 'DevMentor',
          avatar: '',
          dialogue: 'Vamos explorar este codigo juntos!'
        }
      },
      {
        id: '2',
        chapter: 1,
        scene: 2,
        title: 'Desvendando o Misterio',
        narration: 'Ao analisar cada linha, padroes comecaram a emergir...',
        explanation: 'Cada funcao tem um proposito unico na narrativa do codigo.',
        character: {
          name: 'DevMentor',
          avatar: '',
          dialogue: 'Observe como as pecas se encaixam!'
        }
      },
      {
        id: '3',
        chapter: 1,
        scene: 3,
        title: 'A Revelacao',
        narration: 'Finalmente, tudo fez sentido! O codigo revelou seus segredos.',
        explanation: 'Agora voce compreende a estrutura e o proposito deste codigo.',
        character: {
          name: 'DevMentor',
          avatar: '',
          dialogue: 'Parabens! Voce dominou este conceito!'
        },
        choices: [
          { text: 'Explorar mais', next: 'continue' },
          { text: 'Recomecar', next: 'restart' }
        ]
      }
    ];

    setScenes(basicScenes);
  }, [code]);

  const generateStory = useCallback(async () => {
    setLoading(true);
    try {
      // Request story generation from background script
      const response = await chrome.runtime.sendMessage({
        action: 'generate-story',
        code,
        language
      });

      if (response.success && response.data.scenes) {
        setScenes(response.data.scenes);
      } else {
        // Fallback: create basic story structure
        createBasicStory();
      }
    } catch (error) {
      console.error('Error generating story:', error);
      createBasicStory();
    } finally {
      setLoading(false);
    }
  }, [code, language, createBasicStory]);

  useEffect(() => {
    if (code) {
      generateStory();
    }
  }, [code, generateStory]);

  const handlePlay = () => {
    setPlaying(true);
    setTextProgress(0);
  };

  const handleNext = () => {
    if (currentScene < scenes.length - 1) {
      setCurrentScene(prev => prev + 1);
      setTextProgress(0);
      setPlaying(false);
    } else {
      onComplete?.();
    }
  };

  const handleRestart = () => {
    setCurrentScene(0);
    setTextProgress(0);
    setPlaying(false);
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="p-12">
          <motion.div
            className="flex flex-col items-center justify-center gap-4"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <Book className="w-16 h-16 text-primary" />
            <p className="text-lg text-muted-foreground">
              {t('storytelling.generating', 'Criando sua historia...')}
            </p>
          </motion.div>
        </CardContent>
      </Card>
    );
  }

  if (scenes.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="p-12 text-center">
          <Book className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            {t('storytelling.noStory', 'Selecione um codigo para comecar a historia')}
          </p>
        </CardContent>
      </Card>
    );
  }

  const scene = scenes[currentScene];
  const progress = ((currentScene + 1) / scenes.length) * 100;
  const textToShow = scene.narration.substring(
    0,
    Math.floor((scene.narration.length * textProgress) / 100)
  );

  return (
    <div className="w-full space-y-4">
      {/* Progress Header */}
      <Card className="bg-gradient-to-r from-primary/10 to-accent/10">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Book className="w-5 h-5 text-primary" />
              <span className="font-semibold">
                {t('storytelling.chapter')} {scene.chapter} - {t('storytelling.scene')}{' '}
                {scene.scene}
              </span>
            </div>
            <Badge variant="secondary">
              {currentScene + 1} / {scenes.length}
            </Badge>
          </div>
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>

      {/* Main Story Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentScene}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-500" />
                {scene.title}
              </CardTitle>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              {/* Character */}
              {scene.character && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-start gap-4 p-4 bg-secondary/30 rounded-lg"
                >
                  <motion.div
                    className="text-5xl"
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {scene.character.avatar}
                  </motion.div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-4 h-4 text-primary" />
                      <span className="font-semibold">{scene.character.name}</span>
                    </div>
                    <motion.p
                      className="text-sm italic text-muted-foreground"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      "{scene.character.dialogue}"
                    </motion.p>
                  </div>
                </motion.div>
              )}

              {/* Narration */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{t('storytelling.narration')}</span>
                </div>
                <div className="p-4 bg-secondary/20 rounded-lg min-h-[120px]">
                  <motion.p
                    className="text-base leading-relaxed"
                    animate={{ opacity: playing ? 1 : 0.7 }}
                  >
                    {textToShow}
                    {playing && textProgress < 100 && (
                      <motion.span
                        animate={{ opacity: [1, 0] }}
                        transition={{ duration: 0.5, repeat: Infinity }}
                        className="ml-1"
                      >
                        
                      </motion.span>
                    )}
                  </motion.p>
                </div>
              </div>

              {/* Code Block */}
              {scene.code && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="space-y-2"
                >
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Code className="w-4 h-4" />
                    <span>Codigo</span>
                  </div>
                  <pre className="p-4 bg-black/90 text-green-400 rounded-lg overflow-x-auto text-sm">
                    <code>{scene.code}</code>
                  </pre>
                </motion.div>
              )}

              {/* Explanation */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="p-4 bg-primary/5 border-l-4 border-primary rounded-r-lg"
              >
                <p className="text-sm">{scene.explanation}</p>
              </motion.div>

              {/* Choices */}
              {scene.choices && textProgress >= 100 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-2 gap-3 pt-4"
                >
                  {scene.choices.map((choice, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      onClick={() => {
                        if (choice.next === 'restart') {
                          handleRestart();
                        } else {
                          handleNext();
                        }
                      }}
                      className="h-auto py-3"
                    >
                      {choice.text}
                    </Button>
                  ))}
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRestart}
              disabled={currentScene === 0}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              {t('storytelling.restart')}
            </Button>

            <div className="flex gap-2">
              {!playing && textProgress < 100 && (
                <Button size="sm" onClick={handlePlay}>
                  <Play className="w-4 h-4 mr-2" />
                  {t('storytelling.play', 'Reproduzir')}
                </Button>
              )}

              {playing && (
                <Button size="sm" onClick={() => setPlaying(false)} variant="outline">
                  <Pause className="w-4 h-4 mr-2" />
                  {t('storytelling.pause', 'Pausar')}
                </Button>
              )}

              <Button
                size="sm"
                onClick={handleNext}
                disabled={currentScene >= scenes.length - 1}
              >
                {t('storytelling.next', 'Proximo')}
                <SkipForward className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StorytellingMode;

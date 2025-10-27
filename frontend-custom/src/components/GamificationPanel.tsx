import type { LucideIcon } from 'lucide-react';

/**
 * Enhanced Gamification Panel with Animations
 * Beautiful visual feedback for learning progress
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Trophy,
  Star,
  Flame,
  Target,
  Award,
  TrendingUp,
  Zap,
  Crown,
  Sparkles,
  Gift,
  Bolt,
  Book,
  Puzzle,
  Medal,
  Shield,
  Handshake
} from 'lucide-react';

// Icon mapping for badge icons
const BadgeIconMap: Record<string, LucideIcon> = {
  'TROPHY': Trophy,
  'STAR': Star,
  'CROWN': Crown,
  'TARGET': Target,
  'BOLT': Bolt,
  'BOOK': Book,
  'PERFECT': Award,
  'PUZZLE': Puzzle,
  'FLAME': Flame,
  'MEDAL': Medal,
  'SHIELD': Shield,
  'HANDSHAKE': Handshake
};

interface GamificationData {
  level: number;
  xp: number;
  xpToNextLevel: number;
  totalXp: number;
  title: string;
  badges: number;
  streak: number;
  longestStreak: number;
  activeChallenges: number;
  stats: {
    tutorialsCompleted: number;
    exercisesSolved: number;
    perfectScores: number;
    codesAnalyzed: number;
    helpfulActions: number;
  };
  recentBadges: Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
    rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  }>;
}

interface GamificationPanelProps {
  userId?: string;
}

const rarityColors = {
  common: 'bg-gray-500',
  uncommon: 'bg-green-500',
  rare: 'bg-blue-500',
  epic: 'bg-purple-500',
  legendary: 'bg-yellow-500'
};

const GamificationPanel: React.FC<GamificationPanelProps> = ({ userId = 'default' }) => {
  const { t } = useTranslation();
  const [data, setData] = useState<GamificationData | null>(null);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showXpGain, setShowXpGain] = useState(false);
  const [xpGained, setXpGained] = useState(0);

  const loadGamificationData = useCallback(async () => {
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'get-gamification-summary',
        userId
      });

      if (response.success) {
        setData(response.data);
      }
    } catch (error) {
      console.error('Error loading gamification data:', error);
    }
  }, [userId]);

  useEffect(() => {
    loadGamificationData();
  }, [loadGamificationData]);

  const handleAwardXP = async (amount: number, reason: string) => {
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'award-xp',
        userId,
        amount,
        reason
      });

      if (response.success && response.data) {
        setXpGained(response.data.xpAwarded);
        setShowXpGain(true);

        if (response.data.leveledUp) {
          setShowLevelUp(true);
        }

        await loadGamificationData();

        setTimeout(() => setShowXpGain(false), 2000);
        setTimeout(() => setShowLevelUp(false), 5000);
      }
    } catch (error) {
      console.error('Error awarding XP:', error);
    }
  };

  if (!data) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <Sparkles className="w-8 h-8 text-primary" />
            </motion.div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const xpPercentage = (data.xp / data.xpToNextLevel) * 100;

  return (
    <div className="w-full space-y-4">
      {/* XP Gain Animation */}
      <AnimatePresence>
        {showXpGain && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            className="fixed top-4 right-4 z-50"
          >
            <Card className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 shadow-2xl">
              <CardContent className="p-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                <span className="font-bold text-lg">+{xpGained} XP</span>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Level Up Animation */}
      <AnimatePresence>
        {showLevelUp && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ y: 50 }}
              animate={{ y: 0 }}
              className="text-center"
            >
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 360, 0]
                }}
                transition={{ duration: 1, repeat: 2 }}
              >
                <Crown className="w-24 h-24 text-yellow-400 mx-auto mb-4" />
              </motion.div>
              <h2 className="text-5xl font-bold text-white mb-2">
                {t('gamification.levelUp', 'LEVEL UP!')}
              </h2>
              <p className="text-2xl text-yellow-400">
                {t('gamification.level')} {data.level}
              </p>
              <p className="text-xl text-white mt-2">{data.title}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Gamification Card */}
      <Card className="overflow-hidden bg-gradient-to-br from-background to-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            {t('gamification.progress')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Level and XP */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Crown className="w-6 h-6 text-yellow-500" />
                </motion.div>
                <div>
                  <div className="text-sm text-muted-foreground">
                    {t('gamification.level')}
                  </div>
                  <div className="text-2xl font-bold">{data.level}</div>
                </div>
              </div>
              <Badge variant="secondary" className="text-lg px-3 py-1">
                {data.title}
              </Badge>
            </div>

            {/* XP Progress Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {data.xp} / {data.xpToNextLevel} {t('gamification.xp')}
                </span>
                <span className="font-medium">{Math.round(xpPercentage)}%</span>
              </div>
              <div className="relative">
                <Progress value={xpPercentage} className="h-3" />
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  style={{ width: `${xpPercentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Streak */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-lg p-3 border border-orange-500/20"
            >
              <div className="flex items-center gap-2 mb-1">
                <Flame className="w-4 h-4 text-orange-500" />
                <span className="text-xs text-muted-foreground">
                  {t('gamification.streak')}
                </span>
              </div>
              <div className="text-2xl font-bold text-orange-500">
                {data.streak}
                <span className="text-sm text-muted-foreground ml-1">days</span>
              </div>
            </motion.div>

            {/* Badges */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-lg p-3 border border-blue-500/20"
            >
              <div className="flex items-center gap-2 mb-1">
                <Award className="w-4 h-4 text-blue-500" />
                <span className="text-xs text-muted-foreground">
                  {t('gamification.badges')}
                </span>
              </div>
              <div className="text-2xl font-bold text-blue-500">{data.badges}</div>
            </motion.div>

            {/* Active Challenges */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-lg p-3 border border-green-500/20"
            >
              <div className="flex items-center gap-2 mb-1">
                <Target className="w-4 h-4 text-green-500" />
                <span className="text-xs text-muted-foreground">
                  {t('gamification.challenges')}
                </span>
              </div>
              <div className="text-2xl font-bold text-green-500">
                {data.activeChallenges}
              </div>
            </motion.div>

            {/* Total XP */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-br from-yellow-500/10 to-amber-500/10 rounded-lg p-3 border border-yellow-500/20"
            >
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-4 h-4 text-yellow-500" />
                <span className="text-xs text-muted-foreground">Total XP</span>
              </div>
              <div className="text-2xl font-bold text-yellow-500">
                {data.totalXp.toLocaleString()}
              </div>
            </motion.div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Tabs */}
      <Card>
        <Tabs defaultValue="badges" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="badges" className="flex items-center gap-1">
              <Award className="w-4 h-4" />
              {t('gamification.badges')}
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              Stats
            </TabsTrigger>
            <TabsTrigger value="rewards" className="flex items-center gap-1">
              <Gift className="w-4 h-4" />
              {t('gamification.rewards')}
            </TabsTrigger>
          </TabsList>

          {/* Badges Tab */}
          <TabsContent value="badges" className="space-y-3 p-4">
            {data.recentBadges.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                {t('gamification.noBadges', 'Complete desafios para ganhar emblemas!')}
              </p>
            ) : (
              data.recentBadges.map((badge, index) => (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, x: 5 }}
                  className={`p-3 rounded-lg border ${rarityColors[badge.rarity]}/20 bg-gradient-to-r from-transparent to-${rarityColors[badge.rarity]}/5`}
                >
                  <div className="flex items-start gap-3">
                    {(() => {
                      const IconComponent = BadgeIconMap[badge.icon] || Award;
                      return <IconComponent className="w-8 h-8 text-primary" />;
                    })()}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{badge.name}</h4>
                        <Badge variant="outline" className={rarityColors[badge.rarity]}>
                          {badge.rarity}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {badge.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </TabsContent>

          {/* Stats Tab */}
          <TabsContent value="stats" className="space-y-3 p-4">
            {Object.entries(data.stats).map(([key, value], index) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg"
              >
                <span className="text-sm capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </span>
                <Badge variant="secondary" className="text-base font-bold">
                  {value}
                </Badge>
              </motion.div>
            ))}
          </TabsContent>

          {/* Rewards Tab */}
          <TabsContent value="rewards" className="p-4">
            <div className="text-center py-8">
              <Gift className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {t('gamification.rewardsComingSoon', 'Recompensas em breve!')}
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      {/* Test Button (Development Only) */}
      {process.env.NODE_ENV === 'development' && (
        <Button
          onClick={() => handleAwardXP(100, 'Test XP')}
          className="w-full"
          variant="outline"
        >
          <Zap className="w-4 h-4 mr-2" />
          Test +100 XP
        </Button>
      )}
    </div>
  );
};

export default GamificationPanel;



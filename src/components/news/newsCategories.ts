import { Newspaper, Trophy, Dumbbell, Bike, Footprints, Waves, Mountain, Heart, Swords, Globe, Flame, Medal, Zap, Stethoscope, Target, Anchor, TreePine } from 'lucide-react';
import { NewsCategory } from './types';

export const newsCategories: NewsCategory[] = [
  { id: 'latest', icon: Newspaper, titleKey: 'news:categories.latest_news', descKey: 'news:categories.latest_news_desc', color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
  { id: 'biohacker', icon: Zap, titleKey: 'news:categories.biohacker', descKey: 'news:categories.biohacker_desc', color: 'text-violet-500', bgColor: 'bg-violet-500/10' },
  { id: 'bodybuilding', icon: Trophy, titleKey: 'news:categories.bodybuilding', descKey: 'news:categories.bodybuilding_desc', color: 'text-purple-500', bgColor: 'bg-purple-500/10' },
  { id: 'boxing', icon: Target, titleKey: 'news:categories.boxing', descKey: 'news:categories.boxing_desc', color: 'text-red-600', bgColor: 'bg-red-600/10' },
  { id: 'crossfit', icon: Dumbbell, titleKey: 'news:categories.crossfit', descKey: 'news:categories.crossfit_desc', color: 'text-orange-500', bgColor: 'bg-orange-500/10' },
  { id: 'cycling', icon: Bike, titleKey: 'news:categories.cycling', descKey: 'news:categories.cycling_desc', color: 'text-yellow-500', bgColor: 'bg-yellow-500/10' },
  { id: 'global', icon: Globe, titleKey: 'news:categories.global_events', descKey: 'news:categories.global_events_desc', color: 'text-emerald-500', bgColor: 'bg-emerald-500/10' },
  { id: 'hiking', icon: TreePine, titleKey: 'news:categories.hiking', descKey: 'news:categories.hiking_desc', color: 'text-green-600', bgColor: 'bg-green-600/10' },
  { id: 'marathons', icon: Footprints, titleKey: 'news:categories.marathons', descKey: 'news:categories.marathons_desc', color: 'text-green-500', bgColor: 'bg-green-500/10' },
  { id: 'medical', icon: Stethoscope, titleKey: 'news:categories.medical', descKey: 'news:categories.medical_desc', color: 'text-teal-500', bgColor: 'bg-teal-500/10' },
  { id: 'mma', icon: Swords, titleKey: 'news:categories.mma', descKey: 'news:categories.mma_desc', color: 'text-red-500', bgColor: 'bg-red-500/10' },
  { id: 'obstacle', icon: Mountain, titleKey: 'news:categories.obstacle_racing', descKey: 'news:categories.obstacle_racing_desc', color: 'text-amber-600', bgColor: 'bg-amber-600/10' },
  { id: 'swimming', icon: Waves, titleKey: 'news:categories.swimming', descKey: 'news:categories.swimming_desc', color: 'text-sky-500', bgColor: 'bg-sky-500/10' },
  { id: 'triathlons', icon: Medal, titleKey: 'news:categories.triathlons', descKey: 'news:categories.triathlons_desc', color: 'text-cyan-500', bgColor: 'bg-cyan-500/10' },
  { id: 'trx', icon: Anchor, titleKey: 'news:categories.trx', descKey: 'news:categories.trx_desc', color: 'text-amber-500', bgColor: 'bg-amber-500/10' },
  { id: 'ultra', icon: Flame, titleKey: 'news:categories.ultra_endurance', descKey: 'news:categories.ultra_endurance_desc', color: 'text-rose-500', bgColor: 'bg-rose-500/10' },
  { id: 'yoga', icon: Heart, titleKey: 'news:categories.yoga_wellness', descKey: 'news:categories.yoga_wellness_desc', color: 'text-pink-500', bgColor: 'bg-pink-500/10' },
];

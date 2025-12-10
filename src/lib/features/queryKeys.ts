/**
 * Centralized query keys for React Query
 * Improves cache management and prevents key collisions
 */

export const queryKeys = {
  // User related
  user: {
    all: ['user'] as const,
    current: () => [...queryKeys.user.all, 'current'] as const,
    profile: (userId: string) => [...queryKeys.user.all, 'profile', userId] as const,
    preferences: (userId: string) => [...queryKeys.user.all, 'preferences', userId] as const,
  },
  
  // Subscription related
  subscription: {
    all: ['subscription'] as const,
    current: () => [...queryKeys.subscription.all, 'current'] as const,
    features: () => [...queryKeys.subscription.all, 'features'] as const,
  },
  
  // Fitness related
  fitness: {
    all: ['fitness'] as const,
    workouts: (userId: string) => [...queryKeys.fitness.all, 'workouts', userId] as const,
    workout: (workoutId: string) => [...queryKeys.fitness.all, 'workout', workoutId] as const,
    templates: () => [...queryKeys.fitness.all, 'templates'] as const,
    programs: () => [...queryKeys.fitness.all, 'programs'] as const,
  },
  
  // Weight tracking
  weight: {
    all: ['weight'] as const,
    logs: (userId: string) => [...queryKeys.weight.all, 'logs', userId] as const,
    latest: (userId: string) => [...queryKeys.weight.all, 'latest', userId] as const,
    chart: (userId: string, days: number) => [...queryKeys.weight.all, 'chart', userId, days] as const,
  },
  
  // Nutrition
  nutrition: {
    all: ['nutrition'] as const,
    logs: (userId: string, date?: string) => [...queryKeys.nutrition.all, 'logs', userId, date] as const,
    meals: (userId: string) => [...queryKeys.nutrition.all, 'meals', userId] as const,
    recipes: () => [...queryKeys.nutrition.all, 'recipes'] as const,
    mealPlans: (userId: string) => [...queryKeys.nutrition.all, 'mealPlans', userId] as const,
  },
  
  // Social
  social: {
    all: ['social'] as const,
    feed: (page?: number) => [...queryKeys.social.all, 'feed', page] as const,
    posts: (userId: string) => [...queryKeys.social.all, 'posts', userId] as const,
    post: (postId: string) => [...queryKeys.social.all, 'post', postId] as const,
    comments: (postId: string) => [...queryKeys.social.all, 'comments', postId] as const,
    followers: (userId: string) => [...queryKeys.social.all, 'followers', userId] as const,
    following: (userId: string) => [...queryKeys.social.all, 'following', userId] as const,
  },
  
  // Challenges
  challenges: {
    all: ['challenges'] as const,
    active: () => [...queryKeys.challenges.all, 'active'] as const,
    challenge: (challengeId: string) => [...queryKeys.challenges.all, challengeId] as const,
    leaderboard: (challengeId: string) => [...queryKeys.challenges.all, 'leaderboard', challengeId] as const,
  },
  
  // Notifications
  notifications: {
    all: ['notifications'] as const,
    unread: () => [...queryKeys.notifications.all, 'unread'] as const,
    list: (page?: number) => [...queryKeys.notifications.all, 'list', page] as const,
  },
  
  // Messages
  messages: {
    all: ['messages'] as const,
    conversations: () => [...queryKeys.messages.all, 'conversations'] as const,
    conversation: (conversationId: string) => [...queryKeys.messages.all, 'conversation', conversationId] as const,
    unread: () => [...queryKeys.messages.all, 'unread'] as const,
  },
  
  // AI Insights
  insights: {
    all: ['insights'] as const,
    list: (userId: string) => [...queryKeys.insights.all, 'list', userId] as const,
    latest: (userId: string) => [...queryKeys.insights.all, 'latest', userId] as const,
  },
  
  // Groups
  groups: {
    all: ['groups'] as const,
    list: () => [...queryKeys.groups.all, 'list'] as const,
    detail: (groupId: string) => [...queryKeys.groups.all, 'detail', groupId] as const,
    members: (groupId: string) => [...queryKeys.groups.all, 'members', groupId] as const,
  },
};

/**
 * Helper to invalidate all queries in a category
 */
export const invalidateCategory = (queryClient: any, category: keyof typeof queryKeys) => {
  queryClient.invalidateQueries({ queryKey: queryKeys[category].all });
};

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import commonEN from './locales/en/common.json';
import authEN from './locales/en/auth.json';
import fitnessEN from './locales/en/fitness.json';
import socialEN from './locales/en/social.json';
import nutritionEN from './locales/en/nutrition.json';

import commonES from './locales/es/common.json';
import authES from './locales/es/auth.json';
import fitnessES from './locales/es/fitness.json';
import socialES from './locales/es/social.json';
import nutritionES from './locales/es/nutrition.json';
import profileES from './locales/es/profile.json';
import messagesES from './locales/es/messages.json';
import notificationsES from './locales/es/notifications.json';
import errorsES from './locales/es/errors.json';
import rewardsES from './locales/es/rewards.json';
import subscriptionES from './locales/es/subscription.json';
import foodES from './locales/es/food.json';
import workoutES from './locales/es/workout.json';
import settingsES from './locales/es/settings.json';

import commonPT from './locales/pt/common.json';
import authPT from './locales/pt/auth.json';
import fitnessPT from './locales/pt/fitness.json';
import socialPT from './locales/pt/social.json';
import nutritionPT from './locales/pt/nutrition.json';

import commonFR from './locales/fr/common.json';
import authFR from './locales/fr/auth.json';
import fitnessFR from './locales/fr/fitness.json';
import socialFR from './locales/fr/social.json';
import nutritionFR from './locales/fr/nutrition.json';

import commonDE from './locales/de/common.json';
import authDE from './locales/de/auth.json';
import fitnessDE from './locales/de/fitness.json';
import socialDE from './locales/de/social.json';
import nutritionDE from './locales/de/nutrition.json';

import commonZH from './locales/zh/common.json';
import authZH from './locales/zh/auth.json';
import fitnessZH from './locales/zh/fitness.json';
import socialZH from './locales/zh/social.json';
import nutritionZH from './locales/zh/nutrition.json';

const resources = {
  en: {
    common: commonEN,
    auth: authEN,
    fitness: fitnessEN,
    social: socialEN,
    nutrition: nutritionEN,
  },
  es: {
    common: commonES,
    auth: authES,
    fitness: fitnessES,
    social: socialES,
    nutrition: nutritionES,
    profile: profileES,
    messages: messagesES,
    notifications: notificationsES,
    errors: errorsES,
    rewards: rewardsES,
    subscription: subscriptionES,
    food: foodES,
    workout: workoutES,
    settings: settingsES,
  },
  pt: {
    common: commonPT,
    auth: authPT,
    fitness: fitnessPT,
    social: socialPT,
    nutrition: nutritionPT,
  },
  fr: {
    common: commonFR,
    auth: authFR,
    fitness: fitnessFR,
    social: socialFR,
    nutrition: nutritionFR,
  },
  de: {
    common: commonDE,
    auth: authDE,
    fitness: fitnessDE,
    social: socialDE,
    nutrition: nutritionDE,
  },
  zh: {
    common: commonZH,
    auth: authZH,
    fitness: fitnessZH,
    social: socialZH,
    nutrition: nutritionZH,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    defaultNS: 'common',
    ns: ['common', 'auth', 'fitness', 'social', 'nutrition', 'profile', 'messages', 'notifications', 'errors', 'rewards', 'subscription', 'food', 'workout', 'settings'],
    
    interpolation: {
      escapeValue: false,
    },

    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage'],
      excludeCacheFor: ['cimode'],
    },

    react: {
      useSuspense: true,
    },

    // Safari-specific fixes
    load: 'languageOnly', // Load 'en' instead of 'en-US'
    cleanCode: true, // Clean language codes
    
    // Force cache invalidation
    initImmediate: false,
  });

export default i18n;

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { logMissingKey, validateTranslations } from '@/lib/translationUtils';

// Import translation files - English
import commonEN from './locales/en/common.json';
import authEN from './locales/en/auth.json';
import fitnessEN from './locales/en/fitness.json';
import socialEN from './locales/en/social.json';
import nutritionEN from './locales/en/nutrition.json';
import weightEN from './locales/en/weight.json';
import foodEN from './locales/en/food.json';
import workoutEN from './locales/en/workout.json';
import settingsEN from './locales/en/settings.json';
import subscriptionEN from './locales/en/subscription.json';
import rewardsEN from './locales/en/rewards.json';
import referralEN from './locales/en/referral.json';
import privacyEN from './locales/en/privacy.json';
import pointsEN from './locales/en/points.json';
import profileEN from './locales/en/profile.json';
import achievementsEN from './locales/en/achievements.json';
import calendarEN from './locales/en/calendar.json';
import recordsEN from './locales/en/records.json';
import voiceEN from './locales/en/voice.json';
import medicalEN from './locales/en/medical.json';
import timerEN from './locales/en/timer.json';
import liveEN from './locales/en/live.json';
import challengesEN from './locales/en/challenges.json';
import fundraisersEN from './locales/en/fundraisers.json';
import macrosEN from './locales/en/macros.json';
import installEN from './locales/en/install.json';
import searchEN from './locales/en/search.json';
import creatorEN from './locales/en/creator.json';
import aiEN from './locales/en/ai.json';
import measurementsEN from './locales/en/measurements.json';
import trainerEN from './locales/en/trainer.json';
import sessionEN from './locales/en/session.json';
import bookmarksEN from './locales/en/bookmarks.json';
import challengesPageEN from './locales/en/challenges_page.json';
import feedEN from './locales/en/feed.json';
import groupsEN from './locales/en/groups.json';
import followersEN from './locales/en/followers.json';
import scheduleEN from './locales/en/schedule.json';
import seoEN from './locales/en/seo.json';
import unitsEN from './locales/en/units.json';
import a11yEN from './locales/en/a11y.json';
import pluralsEN from './locales/en/plurals.json';

// Spanish
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
import weightES from './locales/es/weight.json';
import referralES from './locales/es/referral.json';
import privacyES from './locales/es/privacy.json';
import pointsES from './locales/es/points.json';
import achievementsES from './locales/es/achievements.json';
import calendarES from './locales/es/calendar.json';
import recordsES from './locales/es/records.json';
import voiceES from './locales/es/voice.json';
import medicalES from './locales/es/medical.json';
import timerES from './locales/es/timer.json';
import liveES from './locales/es/live.json';
import challengesES from './locales/es/challenges.json';
import fundraisersES from './locales/es/fundraisers.json';
import macrosES from './locales/es/macros.json';
import installES from './locales/es/install.json';
import searchES from './locales/es/search.json';
import creatorES from './locales/es/creator.json';
import aiES from './locales/es/ai.json';
import measurementsES from './locales/es/measurements.json';
import trainerES from './locales/es/trainer.json';
import sessionES from './locales/es/session.json';
import bookmarksES from './locales/es/bookmarks.json';
import challengesPageES from './locales/es/challenges_page.json';
import feedES from './locales/es/feed.json';
import groupsES from './locales/es/groups.json';
import followersES from './locales/es/followers.json';
import scheduleES from './locales/es/schedule.json';
import seoES from './locales/es/seo.json';
import unitsES from './locales/es/units.json';
import a11yES from './locales/es/a11y.json';
import pluralsES from './locales/es/plurals.json';

// Portuguese
import commonPT from './locales/pt/common.json';
import authPT from './locales/pt/auth.json';
import fitnessPT from './locales/pt/fitness.json';
import socialPT from './locales/pt/social.json';
import nutritionPT from './locales/pt/nutrition.json';
import seoPT from './locales/pt/seo.json';
import unitsPT from './locales/pt/units.json';
import a11yPT from './locales/pt/a11y.json';
import pluralsPT from './locales/pt/plurals.json';

// French
import commonFR from './locales/fr/common.json';
import authFR from './locales/fr/auth.json';
import fitnessFR from './locales/fr/fitness.json';
import socialFR from './locales/fr/social.json';
import nutritionFR from './locales/fr/nutrition.json';
import seoFR from './locales/fr/seo.json';
import unitsFR from './locales/fr/units.json';
import a11yFR from './locales/fr/a11y.json';
import pluralsFR from './locales/fr/plurals.json';

// German
import commonDE from './locales/de/common.json';
import authDE from './locales/de/auth.json';
import fitnessDE from './locales/de/fitness.json';
import socialDE from './locales/de/social.json';
import nutritionDE from './locales/de/nutrition.json';
import seoDE from './locales/de/seo.json';
import unitsDE from './locales/de/units.json';
import a11yDE from './locales/de/a11y.json';
import pluralsDE from './locales/de/plurals.json';

// Chinese
import commonZH from './locales/zh/common.json';
import authZH from './locales/zh/auth.json';
import fitnessZH from './locales/zh/fitness.json';
import socialZH from './locales/zh/social.json';
import nutritionZH from './locales/zh/nutrition.json';
import seoZH from './locales/zh/seo.json';
import unitsZH from './locales/zh/units.json';
import a11yZH from './locales/zh/a11y.json';
import pluralsZH from './locales/zh/plurals.json';

// All namespaces - used for ns array and type safety
export const allNamespaces = [
  'common', 'auth', 'fitness', 'social', 'nutrition', 'profile', 'messages', 
  'notifications', 'errors', 'rewards', 'subscription', 'food', 'workout', 
  'settings', 'weight', 'referral', 'privacy', 'points', 'achievements', 
  'calendar', 'records', 'voice', 'medical', 'timer', 'live', 'challenges', 
  'fundraisers', 'macros', 'install', 'search', 'creator', 'ai', 'measurements', 
  'trainer', 'session', 'bookmarks', 'challenges_page', 'feed', 'groups', 
  'followers', 'schedule', 'seo', 'units', 'a11y', 'plurals'
] as const;

export type TranslationNamespace = typeof allNamespaces[number];

const resources = {
  en: {
    common: commonEN,
    auth: authEN,
    fitness: fitnessEN,
    social: socialEN,
    nutrition: nutritionEN,
    weight: weightEN,
    food: foodEN,
    workout: workoutEN,
    settings: settingsEN,
    subscription: subscriptionEN,
    rewards: rewardsEN,
    referral: referralEN,
    privacy: privacyEN,
    points: pointsEN,
    profile: profileEN,
    achievements: achievementsEN,
    calendar: calendarEN,
    records: recordsEN,
    voice: voiceEN,
    medical: medicalEN,
    timer: timerEN,
    live: liveEN,
    challenges: challengesEN,
    fundraisers: fundraisersEN,
    macros: macrosEN,
    install: installEN,
    search: searchEN,
    creator: creatorEN,
    ai: aiEN,
    measurements: measurementsEN,
    trainer: trainerEN,
    session: sessionEN,
    bookmarks: bookmarksEN,
    challenges_page: challengesPageEN,
    feed: feedEN,
    groups: groupsEN,
    followers: followersEN,
    schedule: scheduleEN,
    seo: seoEN,
    units: unitsEN,
    a11y: a11yEN,
    plurals: pluralsEN,
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
    weight: weightES,
    referral: referralES,
    privacy: privacyES,
    points: pointsES,
    achievements: achievementsES,
    calendar: calendarES,
    records: recordsES,
    voice: voiceES,
    medical: medicalES,
    timer: timerES,
    live: liveES,
    challenges: challengesES,
    fundraisers: fundraisersES,
    macros: macrosES,
    install: installES,
    search: searchES,
    creator: creatorES,
    ai: aiES,
    measurements: measurementsES,
    trainer: trainerES,
    session: sessionES,
    bookmarks: bookmarksES,
    challenges_page: challengesPageES,
    feed: feedES,
    groups: groupsES,
    followers: followersES,
    schedule: scheduleES,
    seo: seoES,
    units: unitsES,
    a11y: a11yES,
    plurals: pluralsES,
  },
  pt: {
    common: commonPT,
    auth: authPT,
    fitness: fitnessPT,
    social: socialPT,
    nutrition: nutritionPT,
    seo: seoPT,
    units: unitsPT,
    a11y: a11yPT,
    plurals: pluralsPT,
  },
  fr: {
    common: commonFR,
    auth: authFR,
    fitness: fitnessFR,
    social: socialFR,
    nutrition: nutritionFR,
    seo: seoFR,
    units: unitsFR,
    a11y: a11yFR,
    plurals: pluralsFR,
  },
  de: {
    common: commonDE,
    auth: authDE,
    fitness: fitnessDE,
    social: socialDE,
    nutrition: nutritionDE,
    seo: seoDE,
    units: unitsDE,
    a11y: a11yDE,
    plurals: pluralsDE,
  },
  zh: {
    common: commonZH,
    auth: authZH,
    fitness: fitnessZH,
    social: socialZH,
    nutrition: nutritionZH,
    seo: seoZH,
    units: unitsZH,
    a11y: a11yZH,
    plurals: pluralsZH,
  },
};

// Initialize i18n asynchronously for Safari compatibility
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    defaultNS: 'common',
    ns: [...allNamespaces],
    
    interpolation: {
      escapeValue: false,
    },

    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage'],
    },

    react: {
      useSuspense: false, // Changed to false for Safari compatibility
    },

    load: 'languageOnly',
    cleanCode: true,
    initImmediate: false, // Async init for Safari
    
    // Missing key handler - logs warnings in development
    saveMissing: true,
    missingKeyHandler: (lngs, ns, key) => {
      lngs.forEach(lng => logMissingKey(lng, ns, key));
    },
  });

// Validate translation parity in development
if (import.meta.env.DEV) {
  // Run after a short delay to let i18n initialize
  setTimeout(() => {
    validateTranslations(resources, 'en', 'es');
  }, 1000);
}

export { resources };
export default i18n;

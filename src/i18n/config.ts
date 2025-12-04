import i18n from 'i18next';
// Note: addons and professional namespaces added for subscription add-ons and professional portals
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
import messagesEN from './locales/en/messages.json';
import notificationsEN from './locales/en/notifications.json';
import errorsEN from './locales/en/errors.json';
import adminEN from './locales/en/admin.json';
import premiumEN from './locales/en/premium.json';
import videosEN from './locales/en/videos.json';
import chatEN from './locales/en/chat.json';
import celebrationsEN from './locales/en/celebrations.json';
import newsEN from './locales/en/news.json';
import sponsorsEN from './locales/en/sponsors.json';
import locationsEN from './locales/en/locations.json';
import adsEN from './locales/en/ads.json';
import productsEN from './locales/en/products.json';
import recoveryEN from './locales/en/recovery.json';
import addonsEN from './locales/en/addons.json';
import professionalEN from './locales/en/professional.json';
import paymentsEN from './locales/en/payments.json';

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
import adminES from './locales/es/admin.json';
import premiumES from './locales/es/premium.json';
import videosES from './locales/es/videos.json';
import chatES from './locales/es/chat.json';
import celebrationsES from './locales/es/celebrations.json';
import newsES from './locales/es/news.json';
import sponsorsES from './locales/es/sponsors.json';
import locationsES from './locales/es/locations.json';
import adsES from './locales/es/ads.json';
import productsES from './locales/es/products.json';
import recoveryES from './locales/es/recovery.json';
import addonsES from './locales/es/addons.json';
import professionalES from './locales/es/professional.json';
import paymentsES from './locales/es/payments.json';

// Portuguese - Core namespaces only
import commonPT from './locales/pt/common.json';
import authPT from './locales/pt/auth.json';
import fitnessPT from './locales/pt/fitness.json';
import socialPT from './locales/pt/social.json';
import nutritionPT from './locales/pt/nutrition.json';
import seoPT from './locales/pt/seo.json';
import unitsPT from './locales/pt/units.json';
import a11yPT from './locales/pt/a11y.json';
import pluralsPT from './locales/pt/plurals.json';
import adminPT from './locales/pt/admin.json';
import premiumPT from './locales/pt/premium.json';
import subscriptionPT from './locales/pt/subscription.json';
import videosPT from './locales/pt/videos.json';
import feedPT from './locales/pt/feed.json';
import chatPT from './locales/pt/chat.json';
import celebrationsPT from './locales/pt/celebrations.json';
import newsPT from './locales/pt/news.json';
import addonsPT from './locales/pt/addons.json';
import professionalPT from './locales/pt/professional.json';
import recoveryPT from './locales/pt/recovery.json';
import settingsPT from './locales/pt/settings.json';
import locationsPT from './locales/pt/locations.json';
import productsPT from './locales/pt/products.json';
import paymentsPT from './locales/pt/payments.json';

// French - Core + Extended namespaces
import commonFR from './locales/fr/common.json';
import authFR from './locales/fr/auth.json';
import fitnessFR from './locales/fr/fitness.json';
import socialFR from './locales/fr/social.json';
import nutritionFR from './locales/fr/nutrition.json';
import seoFR from './locales/fr/seo.json';
import unitsFR from './locales/fr/units.json';
import a11yFR from './locales/fr/a11y.json';
import pluralsFR from './locales/fr/plurals.json';
import adminFR from './locales/fr/admin.json';
import premiumFR from './locales/fr/premium.json';
import subscriptionFR from './locales/fr/subscription.json';
import videosFR from './locales/fr/videos.json';
import feedFR from './locales/fr/feed.json';
import chatFR from './locales/fr/chat.json';
import celebrationsFR from './locales/fr/celebrations.json';
import newsFR from './locales/fr/news.json';
import addonsFR from './locales/fr/addons.json';
import professionalFR from './locales/fr/professional.json';
import recoveryFR from './locales/fr/recovery.json';
import settingsFR from './locales/fr/settings.json';
import locationsFR from './locales/fr/locations.json';
import productsFR from './locales/fr/products.json';
import challengesPageFR from './locales/fr/challenges_page.json';
import macrosFR from './locales/fr/macros.json';
import measurementsFR from './locales/fr/measurements.json';
import recordsFR from './locales/fr/records.json';
import referralFR from './locales/fr/referral.json';
import rewardsFR from './locales/fr/rewards.json';
import searchFR from './locales/fr/search.json';
import sessionFR from './locales/fr/session.json';
import voiceFR from './locales/fr/voice.json';
import paymentsFR from './locales/fr/payments.json';

// German - Core namespaces only
import commonDE from './locales/de/common.json';
import authDE from './locales/de/auth.json';
import fitnessDE from './locales/de/fitness.json';
import socialDE from './locales/de/social.json';
import nutritionDE from './locales/de/nutrition.json';
import seoDE from './locales/de/seo.json';
import unitsDE from './locales/de/units.json';
import a11yDE from './locales/de/a11y.json';
import pluralsDE from './locales/de/plurals.json';
import adminDE from './locales/de/admin.json';
import premiumDE from './locales/de/premium.json';
import subscriptionDE from './locales/de/subscription.json';
import videosDE from './locales/de/videos.json';
import feedDE from './locales/de/feed.json';
import chatDE from './locales/de/chat.json';
import celebrationsDE from './locales/de/celebrations.json';
import newsDE from './locales/de/news.json';
import addonsDE from './locales/de/addons.json';
import professionalDE from './locales/de/professional.json';
import recoveryDE from './locales/de/recovery.json';
import settingsDE from './locales/de/settings.json';
import locationsDE from './locales/de/locations.json';
import productsDE from './locales/de/products.json';
import paymentsDE from './locales/de/payments.json';

// Chinese - Core namespaces only
import commonZH from './locales/zh/common.json';
import authZH from './locales/zh/auth.json';
import fitnessZH from './locales/zh/fitness.json';
import socialZH from './locales/zh/social.json';
import nutritionZH from './locales/zh/nutrition.json';
import seoZH from './locales/zh/seo.json';
import unitsZH from './locales/zh/units.json';
import a11yZH from './locales/zh/a11y.json';
import pluralsZH from './locales/zh/plurals.json';
import adminZH from './locales/zh/admin.json';
import premiumZH from './locales/zh/premium.json';
import subscriptionZH from './locales/zh/subscription.json';
import videosZH from './locales/zh/videos.json';
import feedZH from './locales/zh/feed.json';
import chatZH from './locales/zh/chat.json';
import celebrationsZH from './locales/zh/celebrations.json';
import newsZH from './locales/zh/news.json';
import addonsZH from './locales/zh/addons.json';
import professionalZH from './locales/zh/professional.json';
import recoveryZH from './locales/zh/recovery.json';
import settingsZH from './locales/zh/settings.json';
import locationsZH from './locales/zh/locations.json';
import productsZH from './locales/zh/products.json';
import paymentsZH from './locales/zh/payments.json';

// Turkish - Core + Extended namespaces
import commonTR from './locales/tr/common.json';
import authTR from './locales/tr/auth.json';
import settingsTR from './locales/tr/settings.json';
import fitnessTR from './locales/tr/fitness.json';
import nutritionTR from './locales/tr/nutrition.json';
import socialTR from './locales/tr/social.json';
import subscriptionTR from './locales/tr/subscription.json';
import premiumTR from './locales/tr/premium.json';
import feedTR from './locales/tr/feed.json';
import chatTR from './locales/tr/chat.json';
import celebrationsTR from './locales/tr/celebrations.json';
import adminTR from './locales/tr/admin.json';
import addonsTR from './locales/tr/addons.json';
import recoveryTR from './locales/tr/recovery.json';
import newsTR from './locales/tr/news.json';
import professionalTR from './locales/tr/professional.json';
import a11yTR from './locales/tr/a11y.json';
import seoTR from './locales/tr/seo.json';
import pluralsTR from './locales/tr/plurals.json';
import unitsTR from './locales/tr/units.json';
import videosTR from './locales/tr/videos.json';
import locationsTR from './locales/tr/locations.json';
import productsTR from './locales/tr/products.json';
import challengesPageTR from './locales/tr/challenges_page.json';
import macrosTR from './locales/tr/macros.json';
import measurementsTR from './locales/tr/measurements.json';
import recordsTR from './locales/tr/records.json';
import referralTR from './locales/tr/referral.json';
import rewardsTR from './locales/tr/rewards.json';
import searchTR from './locales/tr/search.json';
import sessionTR from './locales/tr/session.json';
import voiceTR from './locales/tr/voice.json';
import paymentsTR from './locales/tr/payments.json';

// Italian - Core + Extended namespaces
import commonIT from './locales/it/common.json';
import authIT from './locales/it/auth.json';
import settingsIT from './locales/it/settings.json';
import fitnessIT from './locales/it/fitness.json';
import nutritionIT from './locales/it/nutrition.json';
import socialIT from './locales/it/social.json';
import subscriptionIT from './locales/it/subscription.json';
import premiumIT from './locales/it/premium.json';
import feedIT from './locales/it/feed.json';
import chatIT from './locales/it/chat.json';
import celebrationsIT from './locales/it/celebrations.json';
import adminIT from './locales/it/admin.json';
import addonsIT from './locales/it/addons.json';
import recoveryIT from './locales/it/recovery.json';
import newsIT from './locales/it/news.json';
import professionalIT from './locales/it/professional.json';
import a11yIT from './locales/it/a11y.json';
import seoIT from './locales/it/seo.json';
import pluralsIT from './locales/it/plurals.json';
import unitsIT from './locales/it/units.json';
import videosIT from './locales/it/videos.json';
import locationsIT from './locales/it/locations.json';
import productsIT from './locales/it/products.json';
import challengesPageIT from './locales/it/challenges_page.json';
import macrosIT from './locales/it/macros.json';
import measurementsIT from './locales/it/measurements.json';
import recordsIT from './locales/it/records.json';
import referralIT from './locales/it/referral.json';
import rewardsIT from './locales/it/rewards.json';
import searchIT from './locales/it/search.json';
import sessionIT from './locales/it/session.json';
import voiceIT from './locales/it/voice.json';
import paymentsIT from './locales/it/payments.json';

// Dutch - Core + Extended namespaces
import commonNL from './locales/nl/common.json';
import authNL from './locales/nl/auth.json';
import settingsNL from './locales/nl/settings.json';
import fitnessNL from './locales/nl/fitness.json';
import nutritionNL from './locales/nl/nutrition.json';
import socialNL from './locales/nl/social.json';
import subscriptionNL from './locales/nl/subscription.json';
import premiumNL from './locales/nl/premium.json';
import feedNL from './locales/nl/feed.json';
import chatNL from './locales/nl/chat.json';
import celebrationsNL from './locales/nl/celebrations.json';
import adminNL from './locales/nl/admin.json';
import addonsNL from './locales/nl/addons.json';
import recoveryNL from './locales/nl/recovery.json';
import newsNL from './locales/nl/news.json';
import professionalNL from './locales/nl/professional.json';
import a11yNL from './locales/nl/a11y.json';
import seoNL from './locales/nl/seo.json';
import pluralsNL from './locales/nl/plurals.json';
import unitsNL from './locales/nl/units.json';
import videosNL from './locales/nl/videos.json';
import locationsNL from './locales/nl/locations.json';
import productsNL from './locales/nl/products.json';
import challengesPageNL from './locales/nl/challenges_page.json';
import macrosNL from './locales/nl/macros.json';
import measurementsNL from './locales/nl/measurements.json';
import recordsNL from './locales/nl/records.json';
import referralNL from './locales/nl/referral.json';
import rewardsNL from './locales/nl/rewards.json';
import searchNL from './locales/nl/search.json';
import sessionNL from './locales/nl/session.json';
import voiceNL from './locales/nl/voice.json';
import paymentsNL from './locales/nl/payments.json';

// Russian - Core + Extended namespaces
import commonRU from './locales/ru/common.json';
import authRU from './locales/ru/auth.json';
import settingsRU from './locales/ru/settings.json';
import fitnessRU from './locales/ru/fitness.json';
import nutritionRU from './locales/ru/nutrition.json';
import socialRU from './locales/ru/social.json';
import subscriptionRU from './locales/ru/subscription.json';
import premiumRU from './locales/ru/premium.json';
import feedRU from './locales/ru/feed.json';
import chatRU from './locales/ru/chat.json';
import celebrationsRU from './locales/ru/celebrations.json';
import adminRU from './locales/ru/admin.json';
import addonsRU from './locales/ru/addons.json';
import recoveryRU from './locales/ru/recovery.json';
import newsRU from './locales/ru/news.json';
import professionalRU from './locales/ru/professional.json';
import a11yRU from './locales/ru/a11y.json';
import seoRU from './locales/ru/seo.json';
import pluralsRU from './locales/ru/plurals.json';
import unitsRU from './locales/ru/units.json';
import videosRU from './locales/ru/videos.json';
import locationsRU from './locales/ru/locations.json';
import productsRU from './locales/ru/products.json';
import challengesPageRU from './locales/ru/challenges_page.json';
import macrosRU from './locales/ru/macros.json';
import measurementsRU from './locales/ru/measurements.json';
import recordsRU from './locales/ru/records.json';
import referralRU from './locales/ru/referral.json';
import rewardsRU from './locales/ru/rewards.json';
import searchRU from './locales/ru/search.json';
import sessionRU from './locales/ru/session.json';
import voiceRU from './locales/ru/voice.json';
import paymentsRU from './locales/ru/payments.json';

// Japanese - Core + Extended namespaces
import commonJA from './locales/ja/common.json';
import authJA from './locales/ja/auth.json';
import settingsJA from './locales/ja/settings.json';
import fitnessJA from './locales/ja/fitness.json';
import nutritionJA from './locales/ja/nutrition.json';
import socialJA from './locales/ja/social.json';
import subscriptionJA from './locales/ja/subscription.json';
import premiumJA from './locales/ja/premium.json';
import feedJA from './locales/ja/feed.json';
import chatJA from './locales/ja/chat.json';
import celebrationsJA from './locales/ja/celebrations.json';
import adminJA from './locales/ja/admin.json';
import addonsJA from './locales/ja/addons.json';
import recoveryJA from './locales/ja/recovery.json';
import newsJA from './locales/ja/news.json';
import professionalJA from './locales/ja/professional.json';
import a11yJA from './locales/ja/a11y.json';
import seoJA from './locales/ja/seo.json';
import pluralsJA from './locales/ja/plurals.json';
import unitsJA from './locales/ja/units.json';
import videosJA from './locales/ja/videos.json';
import locationsJA from './locales/ja/locations.json';
import productsJA from './locales/ja/products.json';
import challengesPageJA from './locales/ja/challenges_page.json';
import macrosJA from './locales/ja/macros.json';
import measurementsJA from './locales/ja/measurements.json';
import recordsJA from './locales/ja/records.json';
import referralJA from './locales/ja/referral.json';
import rewardsJA from './locales/ja/rewards.json';
import searchJA from './locales/ja/search.json';
import sessionJA from './locales/ja/session.json';
import voiceJA from './locales/ja/voice.json';
import paymentsJA from './locales/ja/payments.json';

// Korean - Core + Extended namespaces
import commonKO from './locales/ko/common.json';
import authKO from './locales/ko/auth.json';
import settingsKO from './locales/ko/settings.json';
import fitnessKO from './locales/ko/fitness.json';
import nutritionKO from './locales/ko/nutrition.json';
import socialKO from './locales/ko/social.json';
import subscriptionKO from './locales/ko/subscription.json';
import premiumKO from './locales/ko/premium.json';
import feedKO from './locales/ko/feed.json';
import chatKO from './locales/ko/chat.json';
import celebrationsKO from './locales/ko/celebrations.json';
import adminKO from './locales/ko/admin.json';
import addonsKO from './locales/ko/addons.json';
import recoveryKO from './locales/ko/recovery.json';
import newsKO from './locales/ko/news.json';
import professionalKO from './locales/ko/professional.json';
import a11yKO from './locales/ko/a11y.json';
import seoKO from './locales/ko/seo.json';
import pluralsKO from './locales/ko/plurals.json';
import unitsKO from './locales/ko/units.json';
import videosKO from './locales/ko/videos.json';
import locationsKO from './locales/ko/locations.json';
import productsKO from './locales/ko/products.json';
import challengesPageKO from './locales/ko/challenges_page.json';
import macrosKO from './locales/ko/macros.json';
import measurementsKO from './locales/ko/measurements.json';
import recordsKO from './locales/ko/records.json';
import referralKO from './locales/ko/referral.json';
import rewardsKO from './locales/ko/rewards.json';
import searchKO from './locales/ko/search.json';
import sessionKO from './locales/ko/session.json';
import voiceKO from './locales/ko/voice.json';
import paymentsKO from './locales/ko/payments.json';

// Arabic - Core + Extended namespaces
import commonAR from './locales/ar/common.json';
import authAR from './locales/ar/auth.json';
import settingsAR from './locales/ar/settings.json';
import fitnessAR from './locales/ar/fitness.json';
import nutritionAR from './locales/ar/nutrition.json';
import socialAR from './locales/ar/social.json';
import subscriptionAR from './locales/ar/subscription.json';
import premiumAR from './locales/ar/premium.json';
import feedAR from './locales/ar/feed.json';
import chatAR from './locales/ar/chat.json';
import celebrationsAR from './locales/ar/celebrations.json';
import adminAR from './locales/ar/admin.json';
import addonsAR from './locales/ar/addons.json';
import recoveryAR from './locales/ar/recovery.json';
import newsAR from './locales/ar/news.json';
import professionalAR from './locales/ar/professional.json';
import a11yAR from './locales/ar/a11y.json';
import seoAR from './locales/ar/seo.json';
import pluralsAR from './locales/ar/plurals.json';
import unitsAR from './locales/ar/units.json';
import videosAR from './locales/ar/videos.json';
import locationsAR from './locales/ar/locations.json';
import productsAR from './locales/ar/products.json';
import challengesPageAR from './locales/ar/challenges_page.json';
import macrosAR from './locales/ar/macros.json';
import measurementsAR from './locales/ar/measurements.json';
import recordsAR from './locales/ar/records.json';
import referralAR from './locales/ar/referral.json';
import rewardsAR from './locales/ar/rewards.json';
import searchAR from './locales/ar/search.json';
import sessionAR from './locales/ar/session.json';
import voiceAR from './locales/ar/voice.json';
import paymentsAR from './locales/ar/payments.json';

// Hindi - Core + Extended namespaces
import commonHI from './locales/hi/common.json';
import authHI from './locales/hi/auth.json';
import settingsHI from './locales/hi/settings.json';
import fitnessHI from './locales/hi/fitness.json';
import nutritionHI from './locales/hi/nutrition.json';
import socialHI from './locales/hi/social.json';
import subscriptionHI from './locales/hi/subscription.json';
import premiumHI from './locales/hi/premium.json';
import feedHI from './locales/hi/feed.json';
import chatHI from './locales/hi/chat.json';
import celebrationsHI from './locales/hi/celebrations.json';
import adminHI from './locales/hi/admin.json';
import addonsHI from './locales/hi/addons.json';
import recoveryHI from './locales/hi/recovery.json';
import newsHI from './locales/hi/news.json';
import professionalHI from './locales/hi/professional.json';
import a11yHI from './locales/hi/a11y.json';
import seoHI from './locales/hi/seo.json';
import pluralsHI from './locales/hi/plurals.json';
import unitsHI from './locales/hi/units.json';
import videosHI from './locales/hi/videos.json';
import locationsHI from './locales/hi/locations.json';
import productsHI from './locales/hi/products.json';
import challengesPageHI from './locales/hi/challenges_page.json';
import macrosHI from './locales/hi/macros.json';
import measurementsHI from './locales/hi/measurements.json';
import recordsHI from './locales/hi/records.json';
import referralHI from './locales/hi/referral.json';
import rewardsHI from './locales/hi/rewards.json';
import searchHI from './locales/hi/search.json';
import sessionHI from './locales/hi/session.json';
import voiceHI from './locales/hi/voice.json';
import workoutHI from './locales/hi/workout.json';
import paymentsHI from './locales/hi/payments.json';

// Bengali - Core + Extended namespaces
import commonBN from './locales/bn/common.json';
import authBN from './locales/bn/auth.json';
import settingsBN from './locales/bn/settings.json';
import fitnessBN from './locales/bn/fitness.json';
import nutritionBN from './locales/bn/nutrition.json';
import socialBN from './locales/bn/social.json';
import subscriptionBN from './locales/bn/subscription.json';
import premiumBN from './locales/bn/premium.json';
import feedBN from './locales/bn/feed.json';
import chatBN from './locales/bn/chat.json';
import celebrationsBN from './locales/bn/celebrations.json';
import adminBN from './locales/bn/admin.json';
import addonsBN from './locales/bn/addons.json';
import recoveryBN from './locales/bn/recovery.json';
import newsBN from './locales/bn/news.json';
import professionalBN from './locales/bn/professional.json';
import a11yBN from './locales/bn/a11y.json';
import seoBN from './locales/bn/seo.json';
import pluralsBN from './locales/bn/plurals.json';
import unitsBN from './locales/bn/units.json';
import videosBN from './locales/bn/videos.json';
import locationsBN from './locales/bn/locations.json';
import productsBN from './locales/bn/products.json';
import challengesPageBN from './locales/bn/challenges_page.json';
import macrosBN from './locales/bn/macros.json';
import measurementsBN from './locales/bn/measurements.json';
import recordsBN from './locales/bn/records.json';
import referralBN from './locales/bn/referral.json';
import rewardsBN from './locales/bn/rewards.json';
import searchBN from './locales/bn/search.json';
import sessionBN from './locales/bn/session.json';
import voiceBN from './locales/bn/voice.json';
import paymentsBN from './locales/bn/payments.json';

// Indonesian - Core + Extended namespaces
import commonID from './locales/id/common.json';
import authID from './locales/id/auth.json';
import settingsID from './locales/id/settings.json';
import fitnessID from './locales/id/fitness.json';
import nutritionID from './locales/id/nutrition.json';
import socialID from './locales/id/social.json';
import subscriptionID from './locales/id/subscription.json';
import premiumID from './locales/id/premium.json';
import feedID from './locales/id/feed.json';
import chatID from './locales/id/chat.json';
import celebrationsID from './locales/id/celebrations.json';
import adminID from './locales/id/admin.json';
import addonsID from './locales/id/addons.json';
import recoveryID from './locales/id/recovery.json';
import newsID from './locales/id/news.json';
import professionalID from './locales/id/professional.json';
import a11yID from './locales/id/a11y.json';
import seoID from './locales/id/seo.json';
import pluralsID from './locales/id/plurals.json';
import unitsID from './locales/id/units.json';
import videosID from './locales/id/videos.json';
import locationsID from './locales/id/locations.json';
import productsID from './locales/id/products.json';
import challengesPageID from './locales/id/challenges_page.json';
import macrosID from './locales/id/macros.json';
import measurementsID from './locales/id/measurements.json';
import recordsID from './locales/id/records.json';
import referralID from './locales/id/referral.json';
import rewardsID from './locales/id/rewards.json';
import searchID from './locales/id/search.json';
import sessionID from './locales/id/session.json';
import voiceID from './locales/id/voice.json';
import challengesID from './locales/id/challenges.json';
import liveID from './locales/id/live.json';
import paymentsID from './locales/id/payments.json';

// Nigerian Pidgin - Core + Extended namespaces
import commonPCM from './locales/pcm/common.json';
import authPCM from './locales/pcm/auth.json';
import settingsPCM from './locales/pcm/settings.json';
import fitnessPCM from './locales/pcm/fitness.json';
import nutritionPCM from './locales/pcm/nutrition.json';
import socialPCM from './locales/pcm/social.json';
import subscriptionPCM from './locales/pcm/subscription.json';
import premiumPCM from './locales/pcm/premium.json';
import feedPCM from './locales/pcm/feed.json';
import chatPCM from './locales/pcm/chat.json';
import celebrationsPCM from './locales/pcm/celebrations.json';
import adminPCM from './locales/pcm/admin.json';
import addonsPCM from './locales/pcm/addons.json';
import recoveryPCM from './locales/pcm/recovery.json';
import newsPCM from './locales/pcm/news.json';
import professionalPCM from './locales/pcm/professional.json';
import a11yPCM from './locales/pcm/a11y.json';
import seoPCM from './locales/pcm/seo.json';
import pluralsPCM from './locales/pcm/plurals.json';
import unitsPCM from './locales/pcm/units.json';
import videosPCM from './locales/pcm/videos.json';
import locationsPCM from './locales/pcm/locations.json';
import productsPCM from './locales/pcm/products.json';
import challengesPagePCM from './locales/pcm/challenges_page.json';
import macrosPCM from './locales/pcm/macros.json';
import measurementsPCM from './locales/pcm/measurements.json';
import recordsPCM from './locales/pcm/records.json';
import referralPCM from './locales/pcm/referral.json';
import rewardsPCM from './locales/pcm/rewards.json';
import searchPCM from './locales/pcm/search.json';
import sessionPCM from './locales/pcm/session.json';
import voicePCM from './locales/pcm/voice.json';
import paymentsPCM from './locales/pcm/payments.json';

// Tamil - Core + Extended namespaces
import commonTA from './locales/ta/common.json';
import authTA from './locales/ta/auth.json';
import settingsTA from './locales/ta/settings.json';
import fitnessTA from './locales/ta/fitness.json';
import nutritionTA from './locales/ta/nutrition.json';
import socialTA from './locales/ta/social.json';
import subscriptionTA from './locales/ta/subscription.json';
import premiumTA from './locales/ta/premium.json';
import feedTA from './locales/ta/feed.json';
import chatTA from './locales/ta/chat.json';
import celebrationsTA from './locales/ta/celebrations.json';
import adminTA from './locales/ta/admin.json';
import addonsTA from './locales/ta/addons.json';
import recoveryTA from './locales/ta/recovery.json';
import newsTA from './locales/ta/news.json';
import professionalTA from './locales/ta/professional.json';
import a11yTA from './locales/ta/a11y.json';
import seoTA from './locales/ta/seo.json';
import pluralsTA from './locales/ta/plurals.json';
import unitsTA from './locales/ta/units.json';
import videosTA from './locales/ta/videos.json';
import locationsTA from './locales/ta/locations.json';
import productsTA from './locales/ta/products.json';
import challengesPageTA from './locales/ta/challenges_page.json';
import macrosTA from './locales/ta/macros.json';
import measurementsTA from './locales/ta/measurements.json';
import recordsTA from './locales/ta/records.json';
import referralTA from './locales/ta/referral.json';
import rewardsTA from './locales/ta/rewards.json';
import searchTA from './locales/ta/search.json';
import sessionTA from './locales/ta/session.json';
import voiceTA from './locales/ta/voice.json';
import challengesTA from './locales/ta/challenges.json';
import liveTA from './locales/ta/live.json';
import paymentsTA from './locales/ta/payments.json';

// Urdu - Core + Extended namespaces
import commonUR from './locales/ur/common.json';
import authUR from './locales/ur/auth.json';
import settingsUR from './locales/ur/settings.json';
import fitnessUR from './locales/ur/fitness.json';
import nutritionUR from './locales/ur/nutrition.json';
import socialUR from './locales/ur/social.json';
import subscriptionUR from './locales/ur/subscription.json';
import premiumUR from './locales/ur/premium.json';
import feedUR from './locales/ur/feed.json';
import chatUR from './locales/ur/chat.json';
import celebrationsUR from './locales/ur/celebrations.json';
import adminUR from './locales/ur/admin.json';
import addonsUR from './locales/ur/addons.json';
import recoveryUR from './locales/ur/recovery.json';
import newsUR from './locales/ur/news.json';
import professionalUR from './locales/ur/professional.json';
import a11yUR from './locales/ur/a11y.json';
import seoUR from './locales/ur/seo.json';
import pluralsUR from './locales/ur/plurals.json';
import unitsUR from './locales/ur/units.json';
import videosUR from './locales/ur/videos.json';
import locationsUR from './locales/ur/locations.json';
import productsUR from './locales/ur/products.json';
import challengesPageUR from './locales/ur/challenges_page.json';
import macrosUR from './locales/ur/macros.json';
import measurementsUR from './locales/ur/measurements.json';
import recordsUR from './locales/ur/records.json';
import referralUR from './locales/ur/referral.json';
import rewardsUR from './locales/ur/rewards.json';
import searchUR from './locales/ur/search.json';
import sessionUR from './locales/ur/session.json';
import voiceUR from './locales/ur/voice.json';
import paymentsUR from './locales/ur/payments.json';

// Egyptian Arabic - Core + Extended namespaces
import commonARZ from './locales/arz/common.json';
import authARZ from './locales/arz/auth.json';
import settingsARZ from './locales/arz/settings.json';
import fitnessARZ from './locales/arz/fitness.json';
import nutritionARZ from './locales/arz/nutrition.json';
import socialARZ from './locales/arz/social.json';
import subscriptionARZ from './locales/arz/subscription.json';
import premiumARZ from './locales/arz/premium.json';
import feedARZ from './locales/arz/feed.json';
import chatARZ from './locales/arz/chat.json';
import celebrationsARZ from './locales/arz/celebrations.json';
import adminARZ from './locales/arz/admin.json';
import addonsARZ from './locales/arz/addons.json';
import recoveryARZ from './locales/arz/recovery.json';
import newsARZ from './locales/arz/news.json';
import professionalARZ from './locales/arz/professional.json';
import a11yARZ from './locales/arz/a11y.json';
import seoARZ from './locales/arz/seo.json';
import pluralsARZ from './locales/arz/plurals.json';
import unitsARZ from './locales/arz/units.json';
import videosARZ from './locales/arz/videos.json';
import locationsARZ from './locales/arz/locations.json';
import productsARZ from './locales/arz/products.json';
import challengesPageARZ from './locales/arz/challenges_page.json';
import macrosARZ from './locales/arz/macros.json';
import measurementsARZ from './locales/arz/measurements.json';
import recordsARZ from './locales/arz/records.json';
import referralARZ from './locales/arz/referral.json';
import rewardsARZ from './locales/arz/rewards.json';
import searchARZ from './locales/arz/search.json';
import sessionARZ from './locales/arz/session.json';
import voiceARZ from './locales/arz/voice.json';
import paymentsARZ from './locales/arz/payments.json';

// Marathi - Core + Extended namespaces
import commonMR from './locales/mr/common.json';
import authMR from './locales/mr/auth.json';
import settingsMR from './locales/mr/settings.json';
import fitnessMR from './locales/mr/fitness.json';
import nutritionMR from './locales/mr/nutrition.json';
import socialMR from './locales/mr/social.json';
import subscriptionMR from './locales/mr/subscription.json';
import premiumMR from './locales/mr/premium.json';
import feedMR from './locales/mr/feed.json';
import chatMR from './locales/mr/chat.json';
import celebrationsMR from './locales/mr/celebrations.json';
import adminMR from './locales/mr/admin.json';
import addonsMR from './locales/mr/addons.json';
import recoveryMR from './locales/mr/recovery.json';
import newsMR from './locales/mr/news.json';
import professionalMR from './locales/mr/professional.json';
import a11yMR from './locales/mr/a11y.json';
import seoMR from './locales/mr/seo.json';
import pluralsMR from './locales/mr/plurals.json';
import unitsMR from './locales/mr/units.json';
import videosMR from './locales/mr/videos.json';
import locationsMR from './locales/mr/locations.json';
import productsMR from './locales/mr/products.json';
import challengesPageMR from './locales/mr/challenges_page.json';
import macrosMR from './locales/mr/macros.json';
import measurementsMR from './locales/mr/measurements.json';
import recordsMR from './locales/mr/records.json';
import referralMR from './locales/mr/referral.json';
import rewardsMR from './locales/mr/rewards.json';
import searchMR from './locales/mr/search.json';
import sessionMR from './locales/mr/session.json';
import voiceMR from './locales/mr/voice.json';
import paymentsMR from './locales/mr/payments.json';

// Telugu - Core + Extended namespaces
import commonTE from './locales/te/common.json';
import authTE from './locales/te/auth.json';
import settingsTE from './locales/te/settings.json';
import fitnessTE from './locales/te/fitness.json';
import nutritionTE from './locales/te/nutrition.json';
import socialTE from './locales/te/social.json';
import subscriptionTE from './locales/te/subscription.json';
import premiumTE from './locales/te/premium.json';
import feedTE from './locales/te/feed.json';
import chatTE from './locales/te/chat.json';
import celebrationsTE from './locales/te/celebrations.json';
import adminTE from './locales/te/admin.json';
import addonsTE from './locales/te/addons.json';
import recoveryTE from './locales/te/recovery.json';
import newsTE from './locales/te/news.json';
import professionalTE from './locales/te/professional.json';
import a11yTE from './locales/te/a11y.json';
import seoTE from './locales/te/seo.json';
import pluralsTE from './locales/te/plurals.json';
import unitsTE from './locales/te/units.json';
import videosTE from './locales/te/videos.json';
import locationsTE from './locales/te/locations.json';
import productsTE from './locales/te/products.json';
import challengesPageTE from './locales/te/challenges_page.json';
import macrosTE from './locales/te/macros.json';
import measurementsTE from './locales/te/measurements.json';
import recordsTE from './locales/te/records.json';
import referralTE from './locales/te/referral.json';
import rewardsTE from './locales/te/rewards.json';
import searchTE from './locales/te/search.json';
import sessionTE from './locales/te/session.json';
import voiceTE from './locales/te/voice.json';
import paymentsTE from './locales/te/payments.json';

// Vietnamese - Core + Extended namespaces
import commonVI from './locales/vi/common.json';
import authVI from './locales/vi/auth.json';
import settingsVI from './locales/vi/settings.json';
import fitnessVI from './locales/vi/fitness.json';
import nutritionVI from './locales/vi/nutrition.json';
import socialVI from './locales/vi/social.json';
import subscriptionVI from './locales/vi/subscription.json';
import premiumVI from './locales/vi/premium.json';
import feedVI from './locales/vi/feed.json';
import chatVI from './locales/vi/chat.json';
import celebrationsVI from './locales/vi/celebrations.json';
import adminVI from './locales/vi/admin.json';
import addonsVI from './locales/vi/addons.json';
import recoveryVI from './locales/vi/recovery.json';
import newsVI from './locales/vi/news.json';
import professionalVI from './locales/vi/professional.json';
import a11yVI from './locales/vi/a11y.json';
import seoVI from './locales/vi/seo.json';
import pluralsVI from './locales/vi/plurals.json';
import unitsVI from './locales/vi/units.json';
import videosVI from './locales/vi/videos.json';
import locationsVI from './locales/vi/locations.json';
import productsVI from './locales/vi/products.json';
import challengesPageVI from './locales/vi/challenges_page.json';
import macrosVI from './locales/vi/macros.json';
import measurementsVI from './locales/vi/measurements.json';
import recordsVI from './locales/vi/records.json';
import referralVI from './locales/vi/referral.json';
import rewardsVI from './locales/vi/rewards.json';
import searchVI from './locales/vi/search.json';
import sessionVI from './locales/vi/session.json';
import voiceVI from './locales/vi/voice.json';
import paymentsVI from './locales/vi/payments.json';

// All namespaces
export const allNamespaces = [
  'common', 'auth', 'fitness', 'social', 'nutrition', 'profile', 'messages', 
  'notifications', 'errors', 'rewards', 'subscription', 'food', 'workout', 
  'settings', 'weight', 'referral', 'privacy', 'points', 'achievements', 
  'calendar', 'records', 'voice', 'medical', 'timer', 'live', 'challenges', 
  'fundraisers', 'macros', 'install', 'search', 'creator', 'ai', 'measurements', 
  'trainer', 'session', 'bookmarks', 'challenges_page', 'feed', 'groups', 
  'followers', 'schedule', 'seo', 'units', 'a11y', 'plurals', 'admin', 'premium', 
  'videos', 'chat', 'celebrations', 'news', 'sponsors', 'locations', 'ads', 
  'products', 'recovery', 'addons', 'professional', 'payments'
] as const;

export type TranslationNamespace = typeof allNamespaces[number];

const resources = {
  en: {
    common: commonEN, auth: authEN, fitness: fitnessEN, social: socialEN, nutrition: nutritionEN,
    weight: weightEN, food: foodEN, workout: workoutEN, settings: settingsEN, subscription: subscriptionEN,
    rewards: rewardsEN, referral: referralEN, privacy: privacyEN, points: pointsEN, profile: profileEN,
    achievements: achievementsEN, calendar: calendarEN, records: recordsEN, voice: voiceEN, medical: medicalEN,
    timer: timerEN, live: liveEN, challenges: challengesEN, fundraisers: fundraisersEN, macros: macrosEN,
    install: installEN, search: searchEN, creator: creatorEN, ai: aiEN, measurements: measurementsEN,
    trainer: trainerEN, session: sessionEN, bookmarks: bookmarksEN, challenges_page: challengesPageEN,
    feed: feedEN, groups: groupsEN, followers: followersEN, schedule: scheduleEN, seo: seoEN, units: unitsEN,
    a11y: a11yEN, plurals: pluralsEN, messages: messagesEN, notifications: notificationsEN, errors: errorsEN,
    admin: adminEN, premium: premiumEN, videos: videosEN, chat: chatEN, celebrations: celebrationsEN,
    news: newsEN, sponsors: sponsorsEN, locations: locationsEN, ads: adsEN, products: productsEN,
    recovery: recoveryEN, addons: addonsEN, professional: professionalEN, payments: paymentsEN,
  },
  es: {
    common: commonES, auth: authES, fitness: fitnessES, social: socialES, nutrition: nutritionES,
    profile: profileES, messages: messagesES, notifications: notificationsES, errors: errorsES, rewards: rewardsES,
    subscription: subscriptionES, food: foodES, workout: workoutES, settings: settingsES, weight: weightES,
    referral: referralES, privacy: privacyES, points: pointsES, achievements: achievementsES, calendar: calendarES,
    records: recordsES, voice: voiceES, medical: medicalES, timer: timerES, live: liveES, challenges: challengesES,
    fundraisers: fundraisersES, macros: macrosES, install: installES, search: searchES, creator: creatorES,
    ai: aiES, measurements: measurementsES, trainer: trainerES, session: sessionES, bookmarks: bookmarksES,
    challenges_page: challengesPageES, feed: feedES, groups: groupsES, followers: followersES, schedule: scheduleES,
    seo: seoES, units: unitsES, a11y: a11yES, plurals: pluralsES, admin: adminES, premium: premiumES,
    videos: videosES, chat: chatES, celebrations: celebrationsES, news: newsES, sponsors: sponsorsES,
    locations: locationsES, ads: adsES, products: productsES, recovery: recoveryES, addons: addonsES, professional: professionalES, payments: paymentsES,
  },
  pt: {
    common: commonPT, auth: authPT, fitness: fitnessPT, social: socialPT, nutrition: nutritionPT,
    seo: seoPT, units: unitsPT, a11y: a11yPT, plurals: pluralsPT, admin: adminPT, premium: premiumPT,
    subscription: subscriptionPT, videos: videosPT, feed: feedPT, chat: chatPT, celebrations: celebrationsPT,
    news: newsPT, addons: addonsPT, professional: professionalPT, recovery: recoveryPT, settings: settingsPT,
    locations: locationsPT, products: productsPT, payments: paymentsPT,
  },
  fr: {
    common: commonFR, auth: authFR, fitness: fitnessFR, social: socialFR, nutrition: nutritionFR,
    seo: seoFR, units: unitsFR, a11y: a11yFR, plurals: pluralsFR, admin: adminFR, premium: premiumFR,
    subscription: subscriptionFR, videos: videosFR, feed: feedFR, chat: chatFR, celebrations: celebrationsFR,
    news: newsFR, addons: addonsFR, professional: professionalFR, recovery: recoveryFR, settings: settingsFR,
    locations: locationsFR, products: productsFR, challenges_page: challengesPageFR, macros: macrosFR,
    measurements: measurementsFR, records: recordsFR, referral: referralFR, rewards: rewardsFR,
    search: searchFR, session: sessionFR, voice: voiceFR, payments: paymentsFR,
  },
  de: {
    common: commonDE, auth: authDE, fitness: fitnessDE, social: socialDE, nutrition: nutritionDE,
    seo: seoDE, units: unitsDE, a11y: a11yDE, plurals: pluralsDE, admin: adminDE, premium: premiumDE,
    subscription: subscriptionDE, videos: videosDE, feed: feedDE, chat: chatDE, celebrations: celebrationsDE,
    news: newsDE, addons: addonsDE, professional: professionalDE, recovery: recoveryDE, settings: settingsDE,
    locations: locationsDE, products: productsDE, payments: paymentsDE,
  },
  zh: {
    common: commonZH, auth: authZH, settings: settingsZH, fitness: fitnessZH, social: socialZH,
    nutrition: nutritionZH, seo: seoZH, units: unitsZH, a11y: a11yZH, plurals: pluralsZH, admin: adminZH,
    premium: premiumZH, subscription: subscriptionZH, videos: videosZH, feed: feedZH, chat: chatZH,
    celebrations: celebrationsZH, news: newsZH, addons: addonsZH, professional: professionalZH,
    recovery: recoveryZH, locations: locationsZH, products: productsZH, payments: paymentsZH,
  },
  tr: {
    common: commonTR, auth: authTR, settings: settingsTR, fitness: fitnessTR, nutrition: nutritionTR,
    social: socialTR, subscription: subscriptionTR, premium: premiumTR, feed: feedTR, chat: chatTR,
    celebrations: celebrationsTR, admin: adminTR, addons: addonsTR, recovery: recoveryTR, news: newsTR,
    professional: professionalTR, a11y: a11yTR, seo: seoTR, plurals: pluralsTR, units: unitsTR,
    videos: videosTR, locations: locationsTR, products: productsTR, challenges_page: challengesPageTR,
    macros: macrosTR, measurements: measurementsTR, records: recordsTR, referral: referralTR,
    rewards: rewardsTR, search: searchTR, session: sessionTR, voice: voiceTR, payments: paymentsTR,
  },
  it: {
    common: commonIT, auth: authIT, settings: settingsIT, fitness: fitnessIT, nutrition: nutritionIT,
    social: socialIT, subscription: subscriptionIT, premium: premiumIT, feed: feedIT, chat: chatIT,
    celebrations: celebrationsIT, admin: adminIT, addons: addonsIT, recovery: recoveryIT, news: newsIT,
    professional: professionalIT, a11y: a11yIT, seo: seoIT, plurals: pluralsIT, units: unitsIT,
    videos: videosIT, locations: locationsIT, products: productsIT, challenges_page: challengesPageIT,
    macros: macrosIT, measurements: measurementsIT, records: recordsIT, referral: referralIT,
    rewards: rewardsIT, search: searchIT, session: sessionIT, voice: voiceIT, payments: paymentsIT,
  },
  nl: {
    common: commonNL, auth: authNL, settings: settingsNL, fitness: fitnessNL, nutrition: nutritionNL,
    social: socialNL, subscription: subscriptionNL, premium: premiumNL, feed: feedNL, chat: chatNL,
    celebrations: celebrationsNL, admin: adminNL, addons: addonsNL, recovery: recoveryNL, news: newsNL,
    professional: professionalNL, a11y: a11yNL, seo: seoNL, plurals: pluralsNL, units: unitsNL,
    videos: videosNL, locations: locationsNL, products: productsNL, challenges_page: challengesPageNL,
    macros: macrosNL, measurements: measurementsNL, records: recordsNL, referral: referralNL,
    rewards: rewardsNL, search: searchNL, session: sessionNL, voice: voiceNL, payments: paymentsNL,
  },
  ru: {
    common: commonRU, auth: authRU, settings: settingsRU, fitness: fitnessRU, nutrition: nutritionRU,
    social: socialRU, subscription: subscriptionRU, premium: premiumRU, feed: feedRU, chat: chatRU,
    celebrations: celebrationsRU, admin: adminRU, addons: addonsRU, recovery: recoveryRU, news: newsRU,
    professional: professionalRU, a11y: a11yRU, seo: seoRU, plurals: pluralsRU, units: unitsRU,
    videos: videosRU, locations: locationsRU, products: productsRU, challenges_page: challengesPageRU,
    macros: macrosRU, measurements: measurementsRU, records: recordsRU, referral: referralRU,
    rewards: rewardsRU, search: searchRU, session: sessionRU, voice: voiceRU, payments: paymentsRU,
  },
  ja: {
    common: commonJA, auth: authJA, settings: settingsJA, fitness: fitnessJA, nutrition: nutritionJA,
    social: socialJA, subscription: subscriptionJA, premium: premiumJA, feed: feedJA, chat: chatJA,
    celebrations: celebrationsJA, admin: adminJA, addons: addonsJA, recovery: recoveryJA, news: newsJA,
    professional: professionalJA, a11y: a11yJA, seo: seoJA, plurals: pluralsJA, units: unitsJA,
    videos: videosJA, locations: locationsJA, products: productsJA, challenges_page: challengesPageJA,
    macros: macrosJA, measurements: measurementsJA, records: recordsJA, referral: referralJA,
    rewards: rewardsJA, search: searchJA, session: sessionJA, voice: voiceJA, payments: paymentsJA,
  },
  ko: {
    common: commonKO, auth: authKO, settings: settingsKO, fitness: fitnessKO, nutrition: nutritionKO,
    social: socialKO, subscription: subscriptionKO, premium: premiumKO, feed: feedKO, chat: chatKO,
    celebrations: celebrationsKO, admin: adminKO, addons: addonsKO, recovery: recoveryKO, news: newsKO,
    professional: professionalKO, a11y: a11yKO, seo: seoKO, plurals: pluralsKO, units: unitsKO,
    videos: videosKO, locations: locationsKO, products: productsKO, challenges_page: challengesPageKO,
    macros: macrosKO, measurements: measurementsKO, records: recordsKO, referral: referralKO,
    rewards: rewardsKO, search: searchKO, session: sessionKO, voice: voiceKO, payments: paymentsKO,
  },
  ar: {
    common: commonAR, auth: authAR, settings: settingsAR, fitness: fitnessAR, nutrition: nutritionAR,
    social: socialAR, subscription: subscriptionAR, premium: premiumAR, feed: feedAR, chat: chatAR,
    celebrations: celebrationsAR, admin: adminAR, addons: addonsAR, recovery: recoveryAR, news: newsAR,
    professional: professionalAR, a11y: a11yAR, seo: seoAR, plurals: pluralsAR, units: unitsAR,
    videos: videosAR, locations: locationsAR, products: productsAR, challenges_page: challengesPageAR,
    macros: macrosAR, measurements: measurementsAR, records: recordsAR, referral: referralAR,
    rewards: rewardsAR, search: searchAR, session: sessionAR, voice: voiceAR, payments: paymentsAR,
  },
  hi: {
    common: commonHI, auth: authHI, settings: settingsHI, fitness: fitnessHI, nutrition: nutritionHI,
    social: socialHI, subscription: subscriptionHI, premium: premiumHI, feed: feedHI, chat: chatHI,
    celebrations: celebrationsHI, admin: adminHI, addons: addonsHI, recovery: recoveryHI, news: newsHI,
    professional: professionalHI, a11y: a11yHI, seo: seoHI, plurals: pluralsHI, units: unitsHI,
    videos: videosHI, locations: locationsHI, products: productsHI, challenges_page: challengesPageHI,
    macros: macrosHI, measurements: measurementsHI, records: recordsHI, referral: referralHI,
    rewards: rewardsHI, search: searchHI, session: sessionHI, voice: voiceHI, workout: workoutHI, payments: paymentsHI,
  },
  bn: {
    common: commonBN, auth: authBN, settings: settingsBN, fitness: fitnessBN, nutrition: nutritionBN,
    social: socialBN, subscription: subscriptionBN, premium: premiumBN, feed: feedBN, chat: chatBN,
    celebrations: celebrationsBN, admin: adminBN, addons: addonsBN, recovery: recoveryBN, news: newsBN,
    professional: professionalBN, a11y: a11yBN, seo: seoBN, plurals: pluralsBN, units: unitsBN,
    videos: videosBN, locations: locationsBN, products: productsBN, challenges_page: challengesPageBN,
    macros: macrosBN, measurements: measurementsBN, records: recordsBN, referral: referralBN,
    rewards: rewardsBN, search: searchBN, session: sessionBN, voice: voiceBN, payments: paymentsBN,
  },
  id: {
    common: commonID, auth: authID, settings: settingsID, fitness: fitnessID, nutrition: nutritionID,
    social: socialID, subscription: subscriptionID, premium: premiumID, feed: feedID, chat: chatID,
    celebrations: celebrationsID, admin: adminID, addons: addonsID, recovery: recoveryID, news: newsID,
    professional: professionalID, a11y: a11yID, seo: seoID, plurals: pluralsID, units: unitsID,
    videos: videosID, locations: locationsID, products: productsID, challenges_page: challengesPageID,
    macros: macrosID, measurements: measurementsID, records: recordsID, referral: referralID,
    rewards: rewardsID, search: searchID, session: sessionID, voice: voiceID, challenges: challengesID,
    live: liveID, payments: paymentsID,
  },
  pcm: {
    common: commonPCM, auth: authPCM, settings: settingsPCM, fitness: fitnessPCM, nutrition: nutritionPCM,
    social: socialPCM, subscription: subscriptionPCM, premium: premiumPCM, feed: feedPCM, chat: chatPCM,
    celebrations: celebrationsPCM, admin: adminPCM, addons: addonsPCM, recovery: recoveryPCM, news: newsPCM,
    professional: professionalPCM, a11y: a11yPCM, seo: seoPCM, plurals: pluralsPCM, units: unitsPCM,
    videos: videosPCM, locations: locationsPCM, products: productsPCM, challenges_page: challengesPagePCM,
    macros: macrosPCM, measurements: measurementsPCM, records: recordsPCM, referral: referralPCM,
    rewards: rewardsPCM, search: searchPCM, session: sessionPCM, voice: voicePCM, payments: paymentsPCM,
  },
  ta: {
    common: commonTA, auth: authTA, settings: settingsTA, fitness: fitnessTA, nutrition: nutritionTA,
    social: socialTA, subscription: subscriptionTA, premium: premiumTA, feed: feedTA, chat: chatTA,
    celebrations: celebrationsTA, admin: adminTA, addons: addonsTA, recovery: recoveryTA, news: newsTA,
    professional: professionalTA, a11y: a11yTA, seo: seoTA, plurals: pluralsTA, units: unitsTA,
    videos: videosTA, locations: locationsTA, products: productsTA, challenges_page: challengesPageTA,
    macros: macrosTA, measurements: measurementsTA, records: recordsTA, referral: referralTA,
    rewards: rewardsTA, search: searchTA, session: sessionTA, voice: voiceTA, challenges: challengesTA,
    live: liveTA, payments: paymentsTA,
  },
  ur: {
    common: commonUR, auth: authUR, settings: settingsUR, fitness: fitnessUR, nutrition: nutritionUR,
    social: socialUR, subscription: subscriptionUR, premium: premiumUR, feed: feedUR, chat: chatUR,
    celebrations: celebrationsUR, admin: adminUR, addons: addonsUR, recovery: recoveryUR, news: newsUR,
    professional: professionalUR, a11y: a11yUR, seo: seoUR, plurals: pluralsUR, units: unitsUR,
    videos: videosUR, locations: locationsUR, products: productsUR, challenges_page: challengesPageUR,
    macros: macrosUR, measurements: measurementsUR, records: recordsUR, referral: referralUR,
    rewards: rewardsUR, search: searchUR, session: sessionUR, voice: voiceUR, payments: paymentsUR,
  },
  arz: {
    common: commonARZ, auth: authARZ, settings: settingsARZ, fitness: fitnessARZ, nutrition: nutritionARZ,
    social: socialARZ, subscription: subscriptionARZ, premium: premiumARZ, feed: feedARZ, chat: chatARZ,
    celebrations: celebrationsARZ, admin: adminARZ, addons: addonsARZ, recovery: recoveryARZ, news: newsARZ,
    professional: professionalARZ, a11y: a11yARZ, seo: seoARZ, plurals: pluralsARZ, units: unitsARZ,
    videos: videosARZ, locations: locationsARZ, products: productsARZ, challenges_page: challengesPageARZ,
    macros: macrosARZ, measurements: measurementsARZ, records: recordsARZ, referral: referralARZ,
    rewards: rewardsARZ, search: searchARZ, session: sessionARZ, voice: voiceARZ, payments: paymentsARZ,
  },
  mr: {
    common: commonMR, auth: authMR, settings: settingsMR, fitness: fitnessMR, nutrition: nutritionMR,
    social: socialMR, subscription: subscriptionMR, premium: premiumMR, feed: feedMR, chat: chatMR,
    celebrations: celebrationsMR, admin: adminMR, addons: addonsMR, recovery: recoveryMR, news: newsMR,
    professional: professionalMR, a11y: a11yMR, seo: seoMR, plurals: pluralsMR, units: unitsMR,
    videos: videosMR, locations: locationsMR, products: productsMR, challenges_page: challengesPageMR,
    macros: macrosMR, measurements: measurementsMR, records: recordsMR, referral: referralMR,
    rewards: rewardsMR, search: searchMR, session: sessionMR, voice: voiceMR, payments: paymentsMR,
  },
  te: {
    common: commonTE, auth: authTE, settings: settingsTE, fitness: fitnessTE, nutrition: nutritionTE,
    social: socialTE, subscription: subscriptionTE, premium: premiumTE, feed: feedTE, chat: chatTE,
    celebrations: celebrationsTE, admin: adminTE, addons: addonsTE, recovery: recoveryTE, news: newsTE,
    professional: professionalTE, a11y: a11yTE, seo: seoTE, plurals: pluralsTE, units: unitsTE,
    videos: videosTE, locations: locationsTE, products: productsTE, challenges_page: challengesPageTE,
    macros: macrosTE, measurements: measurementsTE, records: recordsTE, referral: referralTE,
    rewards: rewardsTE, search: searchTE, session: sessionTE, voice: voiceTE, payments: paymentsTE,
  },
  vi: {
    common: commonVI, auth: authVI, settings: settingsVI, fitness: fitnessVI, nutrition: nutritionVI,
    social: socialVI, subscription: subscriptionVI, premium: premiumVI, feed: feedVI, chat: chatVI,
    celebrations: celebrationsVI, admin: adminVI, addons: addonsVI, recovery: recoveryVI, news: newsVI,
    professional: professionalVI, a11y: a11yVI, seo: seoVI, plurals: pluralsVI, units: unitsVI,
    videos: videosVI, locations: locationsVI, products: productsVI, challenges_page: challengesPageVI,
    macros: macrosVI, measurements: measurementsVI, records: recordsVI, referral: referralVI,
    rewards: rewardsVI, search: searchVI, session: sessionVI, voice: voiceVI, payments: paymentsVI,
  },
};

// Initialize i18n
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
      useSuspense: false,
    },

    load: 'languageOnly',
    cleanCode: true,
    initImmediate: false,
    
    saveMissing: true,
    missingKeyHandler: (lngs, ns, key) => {
      lngs.forEach(lng => logMissingKey(lng, ns, key));
    },
  });

// Validate translation parity in development
if (import.meta.env.DEV) {
  setTimeout(() => {
    validateTranslations(resources, 'en', 'es');
  }, 1000);
}

export { resources };
export default i18n;

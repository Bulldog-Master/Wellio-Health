import { lazy } from "react";
import { Route, Routes } from "react-router-dom";
import { Layout } from "@/components/layout";
import { ProtectedRoute, RouteErrorBoundary } from "@/components/common";

// Eagerly loaded routes
import Auth from "@/pages/Auth";
import Index from "@/pages/Index";
import Onboarding from "@/pages/Onboarding";
import Weight from "@/pages/Weight";

// Lazy loaded routes - Core
const NotFound = lazy(() => import("@/pages/NotFound"));
const Landing = lazy(() => import("@/pages/Landing"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Install = lazy(() => import("@/pages/Install"));
const PWAFeatures = lazy(() => import("@/pages/PWAFeatures"));
const Support = lazy(() => import("@/pages/Support"));
const HistoryHub = lazy(() => import("@/pages/HistoryHub"));
const EventCalendar = lazy(() => import("@/pages/EventCalendar"));
const ShareProgress = lazy(() => import("@/pages/ShareProgress"));
const GoalSettingWizard = lazy(() => import("@/pages/GoalSettingWizard"));
const VoiceNotes = lazy(() => import("@/pages/VoiceNotes"));

// Lazy loaded routes - Fitness
const Activity = lazy(() => import("@/pages/Activity"));
const Workout = lazy(() => import("@/pages/Workout"));
const WorkoutPrograms = lazy(() => import("@/pages/WorkoutPrograms"));
const WorkoutTemplates = lazy(() => import("@/pages/WorkoutTemplates"));
const WorkoutTemplateDetail = lazy(() => import("@/pages/WorkoutTemplateDetail"));
const WorkoutMedia = lazy(() => import("@/pages/WorkoutMedia"));
const WorkoutSchedule = lazy(() => import("@/pages/WorkoutSchedule"));
const StepCount = lazy(() => import("@/pages/StepCount"));
const Habits = lazy(() => import("@/pages/Habits"));
const IntervalTimer = lazy(() => import("@/pages/IntervalTimer"));
const LiveWorkoutSessions = lazy(() => import("@/pages/LiveWorkoutSessions"));
const LiveSessionRoom = lazy(() => import("@/pages/LiveSessionRoom"));
const BodyMeasurements = lazy(() => import("@/pages/BodyMeasurements"));
const PersonalRecords = lazy(() => import("@/pages/PersonalRecords"));
const FitnessGoals = lazy(() => import("@/pages/FitnessGoals"));
const SleepTracking = lazy(() => import("@/pages/SleepTracking"));
const Recovery = lazy(() => import("@/pages/Recovery"));
const InjuryPrevention = lazy(() => import("@/pages/InjuryPrevention"));
const CircadianRhythm = lazy(() => import("@/pages/CircadianRhythm"));
const EmotionFitness = lazy(() => import("@/pages/EmotionFitness"));
const EnvironmentalFitness = lazy(() => import("@/pages/EnvironmentalFitness"));
const ExerciseLibrary = lazy(() => import("@/pages/ExerciseLibrary"));
const FitnessChat = lazy(() => import("@/pages/FitnessChat"));
const ProgressPhotos = lazy(() => import("@/pages/ProgressPhotos"));
const ProgressComparison = lazy(() => import("@/pages/ProgressComparison"));
const WeeklyProgressReport = lazy(() => import("@/pages/WeeklyProgressReport"));
const WaterIntake = lazy(() => import("@/pages/WaterIntake"));

// Lazy loaded routes - Nutrition
const Food = lazy(() => import("@/pages/Food"));
const FoodLog = lazy(() => import("@/pages/FoodLog"));
const Recipes = lazy(() => import("@/pages/Recipes"));
const RecipeDetail = lazy(() => import("@/pages/RecipeDetail"));
const MealPlanner = lazy(() => import("@/pages/MealPlanner"));
const GroceryList = lazy(() => import("@/pages/GroceryList"));
const MacrosDashboard = lazy(() => import("@/pages/MacrosDashboard"));
const Supplements = lazy(() => import("@/pages/Supplements"));

// Lazy loaded routes - Social
const Feed = lazy(() => import("@/pages/Feed"));
const Messages = lazy(() => import("@/pages/Messages"));
const Conversation = lazy(() => import("@/pages/Conversation"));
const Connect = lazy(() => import("@/pages/Connect"));
const Socials = lazy(() => import("@/pages/Socials"));
const Stories = lazy(() => import("@/pages/Stories"));
const Groups = lazy(() => import("@/pages/Groups"));
const GroupDetail = lazy(() => import("@/pages/GroupDetail"));
const UserProfile = lazy(() => import("@/pages/UserProfile"));
const Profile = lazy(() => import("@/pages/Profile"));
const FollowersList = lazy(() => import("@/pages/FollowersList"));
const CloseFriends = lazy(() => import("@/pages/CloseFriends"));
const Bookmarks = lazy(() => import("@/pages/Bookmarks"));
const Search = lazy(() => import("@/pages/Search"));
const Discover = lazy(() => import("@/pages/Discover"));
const Notifications = lazy(() => import("@/pages/Notifications"));
const News = lazy(() => import("@/pages/News"));

// Lazy loaded routes - Professional
const TrainerPortal = lazy(() => import("@/pages/TrainerPortal"));
const TrainerSetup = lazy(() => import("@/pages/TrainerSetup"));
const TrainerMarketplace = lazy(() => import("@/pages/TrainerMarketplace"));
const PractitionerPortal = lazy(() => import("@/pages/PractitionerPortal"));
const CoachDashboard = lazy(() => import("@/pages/CoachDashboard"));
const ClinicianDashboard = lazy(() => import("@/pages/ClinicianDashboard"));
const CareTeam = lazy(() => import("@/pages/CareTeam"));
const ForProfessionals = lazy(() => import("@/pages/ForProfessionals"));
const ProfessionalHub = lazy(() => import("@/pages/ProfessionalHub"));

// Lazy loaded routes - Settings
const SettingsMenu = lazy(() => import("@/pages/SettingsMenu"));
const PrivacyControls = lazy(() => import("@/pages/PrivacyControls"));
const PrivacySecurity = lazy(() => import("@/pages/PrivacySecurity"));
const PrivacyScore = lazy(() => import("@/pages/PrivacyScore"));
const NotificationSettings = lazy(() => import("@/pages/NotificationSettings"));
const SessionManagement = lazy(() => import("@/pages/SessionManagement"));
const TrustedDevices = lazy(() => import("@/pages/TrustedDevices"));
const AccessibilityPage = lazy(() => import("@/pages/Accessibility"));
const DataExport = lazy(() => import("@/pages/DataExport"));
const AuditTrail = lazy(() => import("@/pages/AuditTrail"));
const SecurityAuditLog = lazy(() => import("@/pages/SecurityAuditLog"));

// Lazy loaded routes - Payments
const Subscription = lazy(() => import("@/pages/Subscription"));
const OrdersPayments = lazy(() => import("@/pages/OrdersPayments"));
const PaymentHistory = lazy(() => import("@/pages/PaymentHistory"));
const RewardsStore = lazy(() => import("@/pages/RewardsStore"));
const PointsHistory = lazy(() => import("@/pages/PointsHistory"));
const Referral = lazy(() => import("@/pages/Referral"));

// Lazy loaded routes - Challenges
const Challenges = lazy(() => import("@/pages/Challenges"));
const SocialChallenges = lazy(() => import("@/pages/SocialChallenges"));
const MicroChallenges = lazy(() => import("@/pages/MicroChallenges"));
const ProgressChallenges = lazy(() => import("@/pages/ProgressChallenges"));
const ProgressChallengeDetail = lazy(() => import("@/pages/ProgressChallengeDetail"));
const Leaderboard = lazy(() => import("@/pages/Leaderboard"));

// Lazy loaded routes - Legal
const PrivacyPolicy = lazy(() => import("@/pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("@/pages/TermsOfService"));
const RefundPolicy = lazy(() => import("@/pages/RefundPolicy"));
const CookiePolicy = lazy(() => import("@/pages/CookiePolicy"));
const AccessibilityStatement = lazy(() => import("@/pages/AccessibilityStatement"));
const CCPARightsRequest = lazy(() => import("@/pages/CCPARightsRequest"));

// Lazy loaded routes - AI
const AIInsights = lazy(() => import("@/pages/AIInsights"));
const AIWorkoutPlanGenerator = lazy(() => import("@/pages/AIWorkoutPlanGenerator"));
const AdvancedAnalytics = lazy(() => import("@/pages/AdvancedAnalytics"));

// Lazy loaded routes - Community
const Fundraisers = lazy(() => import("@/pages/Fundraisers"));
const FundraiserDetail = lazy(() => import("@/pages/FundraiserDetail"));
const CreatorHub = lazy(() => import("@/pages/CreatorHub"));
const Sponsors = lazy(() => import("@/pages/Sponsors"));
const FitnessLocations = lazy(() => import("@/pages/FitnessLocations"));
const RecommendedProducts = lazy(() => import("@/pages/RecommendedProducts"));
const Achievements = lazy(() => import("@/pages/Achievements"));
const PremiumFeatures = lazy(() => import("@/pages/PremiumFeatures"));

// Lazy loaded routes - Medical
const MedicalHistory = lazy(() => import("@/pages/MedicalHistory"));
const Symptoms = lazy(() => import("@/pages/Symptoms"));

// Admin routes
const AdminVIP = lazy(() => import("@/pages/admin/AdminVIP"));
const AdminAdvertisements = lazy(() => import("@/pages/admin/AdminAdvertisements"));
const AdminProfessionals = lazy(() => import("@/pages/admin/AdminProfessionals"));
const AdminPayments = lazy(() => import("@/pages/admin/AdminPayments"));

/**
 * Application route configuration
 * Organized by feature area for better maintainability
 * Each route is wrapped with RouteErrorBoundary for isolated error handling
 */
export const AppRoutes = () => (
  <Routes>
    {/* Public Routes */}
    <Route path="/landing" element={<RouteErrorBoundary><Landing /></RouteErrorBoundary>} />
    <Route path="/auth" element={<RouteErrorBoundary><Auth /></RouteErrorBoundary>} />
    <Route path="/install" element={<RouteErrorBoundary><Install /></RouteErrorBoundary>} />
    
    {/* Protected Routes */}
    <Route path="/onboarding" element={<RouteErrorBoundary><ProtectedRoute><Onboarding /></ProtectedRoute></RouteErrorBoundary>} />
    <Route path="/" element={<RouteErrorBoundary><ProtectedRoute><Layout><Index /></Layout></ProtectedRoute></RouteErrorBoundary>} />
    <Route path="/history" element={<RouteErrorBoundary><ProtectedRoute><Layout><HistoryHub /></Layout></ProtectedRoute></RouteErrorBoundary>} />
    <Route path="/care-team" element={<RouteErrorBoundary><ProtectedRoute><Layout><CareTeam /></Layout></ProtectedRoute></RouteErrorBoundary>} />
    <Route path="/weekly-progress" element={<RouteErrorBoundary><ProtectedRoute><Layout><WeeklyProgressReport /></Layout></ProtectedRoute></RouteErrorBoundary>} />
    <Route path="/advanced-analytics" element={<RouteErrorBoundary><ProtectedRoute><Layout><AdvancedAnalytics /></Layout></ProtectedRoute></RouteErrorBoundary>} />
    
    {/* Profile & Settings */}
    <Route path="/profile" element={<RouteErrorBoundary><ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute></RouteErrorBoundary>} />
    <Route path="/settings" element={<RouteErrorBoundary><ProtectedRoute><Layout><SettingsMenu /></Layout></ProtectedRoute></RouteErrorBoundary>} />
    <Route path="/settings/privacy-security" element={<RouteErrorBoundary><ProtectedRoute><Layout><PrivacySecurity /></Layout></ProtectedRoute></RouteErrorBoundary>} />
    <Route path="/settings/close-friends" element={<RouteErrorBoundary><ProtectedRoute><Layout><CloseFriends /></Layout></ProtectedRoute></RouteErrorBoundary>} />
    <Route path="/settings/trusted-devices" element={<RouteErrorBoundary><ProtectedRoute><Layout><TrustedDevices /></Layout></ProtectedRoute></RouteErrorBoundary>} />
    <Route path="/settings/notifications" element={<RouteErrorBoundary><ProtectedRoute><Layout><NotificationSettings /></Layout></ProtectedRoute></RouteErrorBoundary>} />
    <Route path="/settings/orders-payments" element={<RouteErrorBoundary><ProtectedRoute><Layout><OrdersPayments /></Layout></ProtectedRoute></RouteErrorBoundary>} />
    <Route path="/settings/support" element={<RouteErrorBoundary><ProtectedRoute><Layout><Support /></Layout></ProtectedRoute></RouteErrorBoundary>} />
    <Route path="/settings/privacy-controls" element={<RouteErrorBoundary><ProtectedRoute><Layout><PrivacyControls /></Layout></ProtectedRoute></RouteErrorBoundary>} />
    <Route path="/settings/privacy-score" element={<RouteErrorBoundary><ProtectedRoute><Layout><PrivacyScore /></Layout></ProtectedRoute></RouteErrorBoundary>} />
    <Route path="/settings/session-management" element={<RouteErrorBoundary><ProtectedRoute><Layout><SessionManagement /></Layout></ProtectedRoute></RouteErrorBoundary>} />
    <Route path="/settings/accessibility" element={<RouteErrorBoundary><ProtectedRoute><Layout><AccessibilityPage /></Layout></ProtectedRoute></RouteErrorBoundary>} />
    <Route path="/settings/data-export" element={<RouteErrorBoundary><ProtectedRoute><Layout><DataExport /></Layout></ProtectedRoute></RouteErrorBoundary>} />
    <Route path="/settings/audit-trail" element={<RouteErrorBoundary><ProtectedRoute><Layout><AuditTrail /></Layout></ProtectedRoute></RouteErrorBoundary>} />
    <Route path="/settings/security-audit-log" element={<RouteErrorBoundary><ProtectedRoute><Layout><SecurityAuditLog /></Layout></ProtectedRoute></RouteErrorBoundary>} />
    
    {/* Health & Fitness Tracking */}
    <Route path="/weight" element={<ProtectedRoute><Layout><Weight /></Layout></ProtectedRoute>} />
    <Route path="/water-intake" element={<ProtectedRoute><Layout><WaterIntake /></Layout></ProtectedRoute>} />
    <Route path="/sleep-tracking" element={<ProtectedRoute><Layout><SleepTracking /></Layout></ProtectedRoute>} />
    <Route path="/progress-photos" element={<ProtectedRoute><Layout><ProgressPhotos /></Layout></ProtectedRoute>} />
    <Route path="/body-measurements" element={<ProtectedRoute><Layout><BodyMeasurements /></Layout></ProtectedRoute>} />
    <Route path="/step-count" element={<ProtectedRoute><Layout><StepCount /></Layout></ProtectedRoute>} />
    <Route path="/symptoms" element={<ProtectedRoute><Layout><Symptoms /></Layout></ProtectedRoute>} />
    <Route path="/medical" element={<RouteErrorBoundary><ProtectedRoute><Layout><MedicalHistory /></Layout></ProtectedRoute></RouteErrorBoundary>} />
    
    {/* Nutrition */}
    <Route path="/food" element={<ProtectedRoute><Layout><Food /></Layout></ProtectedRoute>} />
    <Route path="/food/log" element={<ProtectedRoute><Layout><FoodLog /></Layout></ProtectedRoute>} />
    <Route path="/food/recipes" element={<ProtectedRoute><Layout><Recipes /></Layout></ProtectedRoute>} />
    <Route path="/meal-planner" element={<ProtectedRoute><Layout><MealPlanner /></Layout></ProtectedRoute>} />
    <Route path="/macros" element={<ProtectedRoute><Layout><MacrosDashboard /></Layout></ProtectedRoute>} />
    <Route path="/recipe/:recipeId" element={<ProtectedRoute><RecipeDetail /></ProtectedRoute>} />
    <Route path="/grocery-list" element={<ProtectedRoute><Layout><GroceryList /></Layout></ProtectedRoute>} />
    
    {/* Workouts & Training */}
    <Route path="/workout" element={<ProtectedRoute><Layout><Workout /></Layout></ProtectedRoute>} />
    <Route path="/workout-schedule" element={<ProtectedRoute><Layout><WorkoutSchedule /></Layout></ProtectedRoute>} />
    <Route path="/activity" element={<ProtectedRoute><Layout><Activity /></Layout></ProtectedRoute>} />
    <Route path="/interval-timer" element={<ProtectedRoute><Layout><IntervalTimer /></Layout></ProtectedRoute>} />
    <Route path="/workout-programs" element={<ProtectedRoute><Layout><WorkoutPrograms /></Layout></ProtectedRoute>} />
    <Route path="/workout-templates" element={<ProtectedRoute><Layout><WorkoutTemplates /></Layout></ProtectedRoute>} />
    <Route path="/workout-template/:programId" element={<ProtectedRoute><Layout><WorkoutTemplateDetail /></Layout></ProtectedRoute>} />
    <Route path="/weekly-report" element={<ProtectedRoute><Layout><WeeklyProgressReport /></Layout></ProtectedRoute>} />
    <Route path="/goal-wizard" element={<ProtectedRoute><Layout><GoalSettingWizard /></Layout></ProtectedRoute>} />
    <Route path="/ai-workout-plan" element={<ProtectedRoute><Layout><AIWorkoutPlanGenerator /></Layout></ProtectedRoute>} />
    <Route path="/social-challenges" element={<ProtectedRoute><Layout><SocialChallenges /></Layout></ProtectedRoute>} />
    <Route path="/personal-records" element={<ProtectedRoute><Layout><PersonalRecords /></Layout></ProtectedRoute>} />
    <Route path="/live-workout-sessions" element={<ProtectedRoute><Layout><LiveWorkoutSessions /></Layout></ProtectedRoute>} />
    <Route path="/live-session/:sessionId" element={<ProtectedRoute><Layout><LiveSessionRoom /></Layout></ProtectedRoute>} />
    <Route path="/workout-media" element={<ProtectedRoute><Layout><WorkoutMedia /></Layout></ProtectedRoute>} />
    <Route path="/progress-comparison" element={<ProtectedRoute><Layout><ProgressComparison /></Layout></ProtectedRoute>} />
    <Route path="/injury-prevention" element={<ProtectedRoute><InjuryPrevention /></ProtectedRoute>} />
    <Route path="/emotion-fitness" element={<ProtectedRoute><EmotionFitness /></ProtectedRoute>} />
    <Route path="/circadian-rhythm" element={<ProtectedRoute><CircadianRhythm /></ProtectedRoute>} />
    <Route path="/environmental-fitness" element={<ProtectedRoute><EnvironmentalFitness /></ProtectedRoute>} />
    <Route path="/recovery" element={<ProtectedRoute><Layout><Recovery /></Layout></ProtectedRoute>} />
    <Route path="/exercise-library" element={<ProtectedRoute><Layout><ExerciseLibrary /></Layout></ProtectedRoute>} />
    <Route path="/fitness-chat" element={<ProtectedRoute><Layout><FitnessChat /></Layout></ProtectedRoute>} />
    
    {/* Habits & Goals */}
    <Route path="/habits" element={<ProtectedRoute><Layout><Habits /></Layout></ProtectedRoute>} />
    <Route path="/supplements" element={<ProtectedRoute><Layout><Supplements /></Layout></ProtectedRoute>} />
    <Route path="/fitness-goals" element={<ProtectedRoute><Layout><FitnessGoals /></Layout></ProtectedRoute>} />
    <Route path="/achievements" element={<ProtectedRoute><Layout><Achievements /></Layout></ProtectedRoute>} />
    
    {/* AI & Analytics */}
    <Route path="/insights" element={<ProtectedRoute><Layout><AIInsights /></Layout></ProtectedRoute>} />
    <Route path="/analytics" element={<ProtectedRoute><Layout><AdvancedAnalytics /></Layout></ProtectedRoute>} />
    <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
    
    {/* Social Features */}
    <Route path="/connect" element={<ProtectedRoute><Layout><Connect /></Layout></ProtectedRoute>} />
    <Route path="/socials" element={<ProtectedRoute><Layout><Socials /></Layout></ProtectedRoute>} />
    <Route path="/feed" element={<ProtectedRoute><Layout><Feed /></Layout></ProtectedRoute>} />
    <Route path="/discover" element={<ProtectedRoute><Layout><Discover /></Layout></ProtectedRoute>} />
    <Route path="/search" element={<ProtectedRoute><Layout><Search /></Layout></ProtectedRoute>} />
    <Route path="/user/:userId" element={<ProtectedRoute><Layout><UserProfile /></Layout></ProtectedRoute>} />
    <Route path="/user/:userId/followers" element={<ProtectedRoute><Layout><FollowersList /></Layout></ProtectedRoute>} />
    <Route path="/bookmarks" element={<ProtectedRoute><Layout><Bookmarks /></Layout></ProtectedRoute>} />
    <Route path="/groups" element={<ProtectedRoute><Layout><Groups /></Layout></ProtectedRoute>} />
    <Route path="/groups/:groupId" element={<ProtectedRoute><Layout><GroupDetail /></Layout></ProtectedRoute>} />
    <Route path="/notifications" element={<ProtectedRoute><Layout><Notifications /></Layout></ProtectedRoute>} />
    <Route path="/messages" element={<ProtectedRoute><Layout><Messages /></Layout></ProtectedRoute>} />
    <Route path="/messages/:conversationId" element={<ProtectedRoute><Layout><Conversation /></Layout></ProtectedRoute>} />
    <Route path="/stories" element={<ProtectedRoute><Layout><Stories /></Layout></ProtectedRoute>} />
    <Route path="/news" element={<ProtectedRoute><Layout><News /></Layout></ProtectedRoute>} />
    
    {/* Challenges & Community */}
    <Route path="/challenges" element={<ProtectedRoute><Layout><Challenges /></Layout></ProtectedRoute>} />
    <Route path="/leaderboard" element={<ProtectedRoute><Layout><Leaderboard /></Layout></ProtectedRoute>} />
    <Route path="/progress-challenges" element={<ProtectedRoute><Layout><ProgressChallenges /></Layout></ProtectedRoute>} />
    <Route path="/progress-challenge/:challengeId" element={<ProtectedRoute><Layout><ProgressChallengeDetail /></Layout></ProtectedRoute>} />
    <Route path="/micro-challenges" element={<ProtectedRoute><Layout><MicroChallenges /></Layout></ProtectedRoute>} />
    <Route path="/fundraisers" element={<ProtectedRoute><Layout><Fundraisers /></Layout></ProtectedRoute>} />
    <Route path="/fundraiser/:id" element={<ProtectedRoute><Layout><FundraiserDetail /></Layout></ProtectedRoute>} />
    
    {/* Professional Features */}
    <Route path="/trainer/marketplace" element={<RouteErrorBoundary><ProtectedRoute><Layout><TrainerMarketplace /></Layout></ProtectedRoute></RouteErrorBoundary>} />
    <Route path="/trainer/setup" element={<RouteErrorBoundary><ProtectedRoute><Layout><TrainerSetup /></Layout></ProtectedRoute></RouteErrorBoundary>} />
    <Route path="/trainer/portal" element={<RouteErrorBoundary><ProtectedRoute><Layout><TrainerPortal /></Layout></ProtectedRoute></RouteErrorBoundary>} />
    <Route path="/practitioner/portal" element={<RouteErrorBoundary><ProtectedRoute><Layout><PractitionerPortal /></Layout></ProtectedRoute></RouteErrorBoundary>} />
    <Route path="/coach/dashboard" element={<RouteErrorBoundary><ProtectedRoute><Layout><CoachDashboard /></Layout></ProtectedRoute></RouteErrorBoundary>} />
    <Route path="/clinician/dashboard" element={<RouteErrorBoundary><ProtectedRoute><Layout><ClinicianDashboard /></Layout></ProtectedRoute></RouteErrorBoundary>} />
    <Route path="/professional-hub" element={<RouteErrorBoundary><ProtectedRoute><Layout><ProfessionalHub /></Layout></ProtectedRoute></RouteErrorBoundary>} />
    <Route path="/for-professionals" element={<RouteErrorBoundary><ForProfessionals /></RouteErrorBoundary>} />
    <Route path="/creator/hub" element={<RouteErrorBoundary><ProtectedRoute><Layout><CreatorHub /></Layout></ProtectedRoute></RouteErrorBoundary>} />
    
    {/* Payments & Subscriptions */}
    <Route path="/subscription" element={<ProtectedRoute><Layout><Subscription /></Layout></ProtectedRoute>} />
    <Route path="/referral" element={<ProtectedRoute><Layout><Referral /></Layout></ProtectedRoute>} />
    <Route path="/rewards" element={<ProtectedRoute><Layout><RewardsStore /></Layout></ProtectedRoute>} />
    <Route path="/points-history" element={<ProtectedRoute><Layout><PointsHistory /></Layout></ProtectedRoute>} />
    <Route path="/payment-history" element={<ProtectedRoute><Layout><PaymentHistory /></Layout></ProtectedRoute>} />
    
    {/* Misc Features */}
    <Route path="/calendar" element={<ProtectedRoute><Layout><EventCalendar /></Layout></ProtectedRoute>} />
    <Route path="/voice-notes" element={<ProtectedRoute><Layout><VoiceNotes /></Layout></ProtectedRoute>} />
    <Route path="/pwa-features" element={<ProtectedRoute><Layout><PWAFeatures /></Layout></ProtectedRoute>} />
    <Route path="/sponsors" element={<ProtectedRoute><Layout><Sponsors /></Layout></ProtectedRoute>} />
    <Route path="/locations" element={<ProtectedRoute><Layout><FitnessLocations /></Layout></ProtectedRoute>} />
    <Route path="/recommended-products" element={<ProtectedRoute><Layout><RecommendedProducts /></Layout></ProtectedRoute>} />
    <Route path="/premium" element={<ProtectedRoute><Layout><PremiumFeatures /></Layout></ProtectedRoute>} />
    <Route path="/share-progress" element={<ProtectedRoute><Layout><ShareProgress /></Layout></ProtectedRoute>} />
    
    {/* Legal Pages */}
    <Route path="/privacy-policy" element={<PrivacyPolicy />} />
    <Route path="/terms" element={<TermsOfService />} />
    <Route path="/refund-policy" element={<RefundPolicy />} />
    <Route path="/cookie-policy" element={<CookiePolicy />} />
    <Route path="/accessibility-statement" element={<AccessibilityStatement />} />
    <Route path="/ccpa-rights" element={<CCPARightsRequest />} />
    
    {/* Admin Routes */}
    <Route path="/admin/vip" element={<RouteErrorBoundary><ProtectedRoute><Layout><AdminVIP /></Layout></ProtectedRoute></RouteErrorBoundary>} />
    <Route path="/admin/advertisements" element={<RouteErrorBoundary><ProtectedRoute><Layout><AdminAdvertisements /></Layout></ProtectedRoute></RouteErrorBoundary>} />
    <Route path="/admin/professionals" element={<RouteErrorBoundary><ProtectedRoute><Layout><AdminProfessionals /></Layout></ProtectedRoute></RouteErrorBoundary>} />
    <Route path="/admin/payments" element={<RouteErrorBoundary><ProtectedRoute><Layout><AdminPayments /></Layout></ProtectedRoute></RouteErrorBoundary>} />
    
    {/* 404 */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);

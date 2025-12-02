import { lazy } from "react";
import { Route, Routes } from "react-router-dom";
import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { RouteErrorBoundary } from "@/components/RouteErrorBoundary";

// Eagerly loaded routes
import Auth from "@/pages/Auth";
import Index from "@/pages/Index";
import Onboarding from "@/pages/Onboarding";
import Weight from "@/pages/Weight";

// Lazy loaded routes
const Profile = lazy(() => import("@/pages/Profile"));
const Food = lazy(() => import("@/pages/Food"));
const FoodLog = lazy(() => import("@/pages/FoodLog"));
const Recipes = lazy(() => import("@/pages/Recipes"));
const Workout = lazy(() => import("@/pages/Workout"));
const WorkoutSchedule = lazy(() => import("@/pages/WorkoutSchedule"));
const Activity = lazy(() => import("@/pages/Activity"));
const Habits = lazy(() => import("@/pages/Habits"));
const Supplements = lazy(() => import("@/pages/Supplements"));
const IntervalTimer = lazy(() => import("@/pages/IntervalTimer"));
const Symptoms = lazy(() => import("@/pages/Symptoms"));
const MedicalHistory = lazy(() => import("@/pages/MedicalHistory"));
const AIInsights = lazy(() => import("@/pages/AIInsights"));
const Socials = lazy(() => import("@/pages/Socials"));
const Referral = lazy(() => import("@/pages/Referral"));
const RewardsStore = lazy(() => import("@/pages/RewardsStore"));
const PointsHistory = lazy(() => import("@/pages/PointsHistory"));
const FitnessGoals = lazy(() => import("@/pages/FitnessGoals"));
const Achievements = lazy(() => import("@/pages/Achievements"));
const StepCount = lazy(() => import("@/pages/StepCount"));
const PrivacySecurity = lazy(() => import("@/pages/PrivacySecurity"));
const NotificationSettings = lazy(() => import("@/pages/NotificationSettings"));
const OrdersPayments = lazy(() => import("@/pages/OrdersPayments"));
const Support = lazy(() => import("@/pages/Support"));
const SettingsMenu = lazy(() => import("@/pages/SettingsMenu"));
const TrustedDevices = lazy(() => import("@/pages/TrustedDevices"));
const WaterIntake = lazy(() => import("@/pages/WaterIntake"));
const SleepTracking = lazy(() => import("@/pages/SleepTracking"));
const ProgressPhotos = lazy(() => import("@/pages/ProgressPhotos"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const BodyMeasurements = lazy(() => import("@/pages/BodyMeasurements"));
const MealPlanner = lazy(() => import("@/pages/MealPlanner"));
const MacrosDashboard = lazy(() => import("@/pages/MacrosDashboard"));
const WorkoutPrograms = lazy(() => import("@/pages/WorkoutPrograms"));
const TrainerMarketplace = lazy(() => import("@/pages/TrainerMarketplace"));
const TrainerSetup = lazy(() => import("@/pages/TrainerSetup"));
const CreatorHub = lazy(() => import("@/pages/CreatorHub"));
const Discover = lazy(() => import("@/pages/Discover"));
const Challenges = lazy(() => import("@/pages/Challenges"));
const Leaderboard = lazy(() => import("@/pages/Leaderboard"));
const Feed = lazy(() => import("@/pages/Feed"));
const Connect = lazy(() => import("@/pages/Connect"));
const Bookmarks = lazy(() => import("@/pages/Bookmarks"));
const UserProfile = lazy(() => import("@/pages/UserProfile"));
const Notifications = lazy(() => import("@/pages/Notifications"));
const Search = lazy(() => import("@/pages/Search"));
const FollowersList = lazy(() => import("@/pages/FollowersList"));
const Messages = lazy(() => import("@/pages/Messages"));
const Conversation = lazy(() => import("@/pages/Conversation"));
const Groups = lazy(() => import("@/pages/Groups"));
const GroupDetail = lazy(() => import("@/pages/GroupDetail"));
const CloseFriends = lazy(() => import("@/pages/CloseFriends"));
const LiveWorkoutSessions = lazy(() => import("@/pages/LiveWorkoutSessions"));
const LiveSessionRoom = lazy(() => import("@/pages/LiveSessionRoom"));
const ProgressChallenges = lazy(() => import("@/pages/ProgressChallenges"));
const ProgressChallengeDetail = lazy(() => import("@/pages/ProgressChallengeDetail"));
const RecipeDetail = lazy(() => import("@/pages/RecipeDetail"));
const WorkoutTemplates = lazy(() => import("@/pages/WorkoutTemplates"));
const WorkoutTemplateDetail = lazy(() => import("@/pages/WorkoutTemplateDetail"));
const EventCalendar = lazy(() => import("@/pages/EventCalendar"));
const VoiceNotes = lazy(() => import("@/pages/VoiceNotes"));
const PersonalRecords = lazy(() => import("@/pages/PersonalRecords"));
const AdvancedAnalytics = lazy(() => import("@/pages/AdvancedAnalytics"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Install = lazy(() => import("@/pages/Install"));
const PWAFeatures = lazy(() => import("@/pages/PWAFeatures"));
const Fundraisers = lazy(() => import("@/pages/Fundraisers"));
const FundraiserDetail = lazy(() => import("@/pages/FundraiserDetail"));
const Subscription = lazy(() => import("@/pages/Subscription"));
const AdminVIP = lazy(() => import("@/pages/AdminVIP"));
const PremiumFeatures = lazy(() => import("@/pages/PremiumFeatures"));
const ExerciseLibrary = lazy(() => import("@/pages/ExerciseLibrary"));
const FitnessChat = lazy(() => import("@/pages/FitnessChat"));
const News = lazy(() => import("@/pages/News"));
const Sponsors = lazy(() => import("@/pages/Sponsors"));
const FitnessLocations = lazy(() => import("@/pages/FitnessLocations"));
const AdminAdvertisements = lazy(() => import("@/pages/AdminAdvertisements"));
const RecommendedProducts = lazy(() => import("@/pages/RecommendedProducts"));

/**
 * Application route configuration
 * Organized by feature area for better maintainability
 * Each route is wrapped with RouteErrorBoundary for isolated error handling
 */
export const AppRoutes = () => (
  <Routes>
    {/* Public Routes */}
    <Route path="/auth" element={<RouteErrorBoundary><Auth /></RouteErrorBoundary>} />
    <Route path="/install" element={<RouteErrorBoundary><Install /></RouteErrorBoundary>} />
    
    {/* Protected Routes */}
    <Route path="/onboarding" element={<RouteErrorBoundary><ProtectedRoute><Onboarding /></ProtectedRoute></RouteErrorBoundary>} />
    <Route path="/" element={<RouteErrorBoundary><ProtectedRoute><Index /></ProtectedRoute></RouteErrorBoundary>} />
    
    {/* Profile & Settings */}
    <Route path="/profile" element={<RouteErrorBoundary><ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute></RouteErrorBoundary>} />
    <Route path="/settings" element={<RouteErrorBoundary><ProtectedRoute><Layout><SettingsMenu /></Layout></ProtectedRoute></RouteErrorBoundary>} />
    <Route path="/settings/privacy-security" element={<RouteErrorBoundary><ProtectedRoute><Layout><PrivacySecurity /></Layout></ProtectedRoute></RouteErrorBoundary>} />
    <Route path="/settings/close-friends" element={<RouteErrorBoundary><ProtectedRoute><Layout><CloseFriends /></Layout></ProtectedRoute></RouteErrorBoundary>} />
    <Route path="/settings/trusted-devices" element={<RouteErrorBoundary><ProtectedRoute><Layout><TrustedDevices /></Layout></ProtectedRoute></RouteErrorBoundary>} />
    <Route path="/settings/notifications" element={<RouteErrorBoundary><ProtectedRoute><Layout><NotificationSettings /></Layout></ProtectedRoute></RouteErrorBoundary>} />
    <Route path="/settings/orders-payments" element={<RouteErrorBoundary><ProtectedRoute><Layout><OrdersPayments /></Layout></ProtectedRoute></RouteErrorBoundary>} />
    <Route path="/settings/support" element={<RouteErrorBoundary><ProtectedRoute><Layout><Support /></Layout></ProtectedRoute></RouteErrorBoundary>} />
    
    {/* Health & Fitness Tracking */}
    <Route path="/weight" element={<ProtectedRoute><Weight /></ProtectedRoute>} />
    <Route path="/water-intake" element={<ProtectedRoute><Layout><WaterIntake /></Layout></ProtectedRoute>} />
    <Route path="/sleep-tracking" element={<ProtectedRoute><Layout><SleepTracking /></Layout></ProtectedRoute>} />
    <Route path="/progress-photos" element={<ProtectedRoute><Layout><ProgressPhotos /></Layout></ProtectedRoute>} />
    <Route path="/body-measurements" element={<ProtectedRoute><Layout><BodyMeasurements /></Layout></ProtectedRoute>} />
    <Route path="/step-count" element={<ProtectedRoute><StepCount /></ProtectedRoute>} />
    <Route path="/symptoms" element={<ProtectedRoute><Layout><Symptoms /></Layout></ProtectedRoute>} />
    <Route path="/medical" element={<RouteErrorBoundary><ProtectedRoute><Layout><MedicalHistory /></Layout></ProtectedRoute></RouteErrorBoundary>} />
    
    {/* Nutrition */}
    <Route path="/food" element={<ProtectedRoute><Layout><Food /></Layout></ProtectedRoute>} />
    <Route path="/food/log" element={<ProtectedRoute><Layout><FoodLog /></Layout></ProtectedRoute>} />
    <Route path="/food/recipes" element={<ProtectedRoute><Layout><Recipes /></Layout></ProtectedRoute>} />
    <Route path="/meal-planner" element={<ProtectedRoute><Layout><MealPlanner /></Layout></ProtectedRoute>} />
    <Route path="/macros" element={<ProtectedRoute><Layout><MacrosDashboard /></Layout></ProtectedRoute>} />
    <Route path="/recipe/:recipeId" element={<ProtectedRoute><RecipeDetail /></ProtectedRoute>} />
    
    {/* Workouts & Training */}
    <Route path="/workout" element={<ProtectedRoute><Layout><Workout /></Layout></ProtectedRoute>} />
    <Route path="/workout-schedule" element={<ProtectedRoute><Layout><WorkoutSchedule /></Layout></ProtectedRoute>} />
    <Route path="/activity" element={<ProtectedRoute><Layout><Activity /></Layout></ProtectedRoute>} />
    <Route path="/interval-timer" element={<ProtectedRoute><Layout><IntervalTimer /></Layout></ProtectedRoute>} />
    <Route path="/workout-programs" element={<ProtectedRoute><Layout><WorkoutPrograms /></Layout></ProtectedRoute>} />
    <Route path="/workout-templates" element={<ProtectedRoute><Layout><WorkoutTemplates /></Layout></ProtectedRoute>} />
    <Route path="/workout-template/:programId" element={<ProtectedRoute><Layout><WorkoutTemplateDetail /></Layout></ProtectedRoute>} />
    <Route path="/personal-records" element={<ProtectedRoute><Layout><PersonalRecords /></Layout></ProtectedRoute>} />
    <Route path="/live-workout-sessions" element={<ProtectedRoute><LiveWorkoutSessions /></ProtectedRoute>} />
    <Route path="/live-session/:sessionId" element={<ProtectedRoute><LiveSessionRoom /></ProtectedRoute>} />
    
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
    
    {/* Challenges & Community */}
    <Route path="/challenges" element={<ProtectedRoute><Layout><Challenges /></Layout></ProtectedRoute>} />
    <Route path="/leaderboard" element={<ProtectedRoute><Layout><Leaderboard /></Layout></ProtectedRoute>} />
    <Route path="/progress-challenges" element={<ProtectedRoute><ProgressChallenges /></ProtectedRoute>} />
    <Route path="/progress-challenge/:challengeId" element={<ProtectedRoute><ProgressChallengeDetail /></ProtectedRoute>} />
    <Route path="/fundraisers" element={<ProtectedRoute><Layout><Fundraisers /></Layout></ProtectedRoute>} />
    <Route path="/fundraiser/:id" element={<ProtectedRoute><Layout><FundraiserDetail /></Layout></ProtectedRoute>} />
    
    {/* Trainer & Creator */}
    <Route path="/trainer/marketplace" element={<ProtectedRoute><Layout><TrainerMarketplace /></Layout></ProtectedRoute>} />
    <Route path="/trainer/setup" element={<ProtectedRoute><Layout><TrainerSetup /></Layout></ProtectedRoute>} />
    <Route path="/creator/hub" element={<ProtectedRoute><Layout><CreatorHub /></Layout></ProtectedRoute>} />
    
    {/* Misc */}
    <Route path="/referral" element={<ProtectedRoute><Layout><Referral /></Layout></ProtectedRoute>} />
    <Route path="/rewards" element={<ProtectedRoute><Layout><RewardsStore /></Layout></ProtectedRoute>} />
    <Route path="/points-history" element={<ProtectedRoute><Layout><PointsHistory /></Layout></ProtectedRoute>} />
    <Route path="/calendar" element={<ProtectedRoute><Layout><EventCalendar /></Layout></ProtectedRoute>} />
    <Route path="/voice-notes" element={<ProtectedRoute><Layout><VoiceNotes /></Layout></ProtectedRoute>} />
    <Route path="/pwa-features" element={<ProtectedRoute><Layout><PWAFeatures /></Layout></ProtectedRoute>} />
    <Route path="/subscription" element={<ProtectedRoute><Layout><Subscription /></Layout></ProtectedRoute>} />
    <Route path="/admin/vip" element={<RouteErrorBoundary><ProtectedRoute><Layout><AdminVIP /></Layout></ProtectedRoute></RouteErrorBoundary>} />
    <Route path="/admin/ads" element={<RouteErrorBoundary><ProtectedRoute><Layout><AdminAdvertisements /></Layout></ProtectedRoute></RouteErrorBoundary>} />
    <Route path="/premium" element={<RouteErrorBoundary><ProtectedRoute><Layout><PremiumFeatures /></Layout></ProtectedRoute></RouteErrorBoundary>} />
    <Route path="/exercise-library" element={<RouteErrorBoundary><ProtectedRoute><Layout><ExerciseLibrary /></Layout></ProtectedRoute></RouteErrorBoundary>} />
    <Route path="/fitness-chat" element={<RouteErrorBoundary><ProtectedRoute><Layout><FitnessChat /></Layout></ProtectedRoute></RouteErrorBoundary>} />
    <Route path="/news" element={<RouteErrorBoundary><ProtectedRoute><Layout><News /></Layout></ProtectedRoute></RouteErrorBoundary>} />
    <Route path="/sponsors" element={<RouteErrorBoundary><ProtectedRoute><Layout><Sponsors /></Layout></ProtectedRoute></RouteErrorBoundary>} />
    <Route path="/locations" element={<RouteErrorBoundary><ProtectedRoute><Layout><FitnessLocations /></Layout></ProtectedRoute></RouteErrorBoundary>} />
    <Route path="/products" element={<RouteErrorBoundary><ProtectedRoute><Layout><RecommendedProducts /></Layout></ProtectedRoute></RouteErrorBoundary>} />
    
    {/* 404 */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);

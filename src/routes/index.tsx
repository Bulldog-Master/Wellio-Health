import { lazy } from "react";
import { Route, Routes } from "react-router-dom";
import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";

// Eagerly loaded routes
import Auth from "@/pages/Auth";
import Index from "@/pages/Index";
import Onboarding from "@/pages/Onboarding";

// Lazy loaded routes
const Profile = lazy(() => import("@/pages/Profile"));
const Weight = lazy(() => import("@/pages/Weight"));
const Food = lazy(() => import("@/pages/Food"));
const FoodLog = lazy(() => import("@/pages/FoodLog"));
const Recipes = lazy(() => import("@/pages/Recipes"));
const Workout = lazy(() => import("@/pages/Workout"));
const Activity = lazy(() => import("@/pages/Activity"));
const Habits = lazy(() => import("@/pages/Habits"));
const Supplements = lazy(() => import("@/pages/Supplements"));
const IntervalTimer = lazy(() => import("@/pages/IntervalTimer"));
const Symptoms = lazy(() => import("@/pages/Symptoms"));
const MedicalHistory = lazy(() => import("@/pages/MedicalHistory"));
const AIInsights = lazy(() => import("@/pages/AIInsights"));
const Socials = lazy(() => import("@/pages/Socials"));
const Referral = lazy(() => import("@/pages/Referral"));
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

/**
 * Application route configuration
 * Organized by feature area for better maintainability
 */
export const AppRoutes = () => (
  <Routes>
    {/* Public Routes */}
    <Route path="/auth" element={<Auth />} />
    <Route path="/install" element={<Install />} />
    
    {/* Protected Routes */}
    <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
    <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
    
    {/* Profile & Settings */}
    <Route path="/profile" element={<ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>} />
    <Route path="/settings" element={<ProtectedRoute><Layout><SettingsMenu /></Layout></ProtectedRoute>} />
    <Route path="/settings/privacy-security" element={<ProtectedRoute><Layout><PrivacySecurity /></Layout></ProtectedRoute>} />
    <Route path="/settings/close-friends" element={<ProtectedRoute><Layout><CloseFriends /></Layout></ProtectedRoute>} />
    <Route path="/settings/trusted-devices" element={<ProtectedRoute><Layout><TrustedDevices /></Layout></ProtectedRoute>} />
    <Route path="/settings/notifications" element={<ProtectedRoute><Layout><NotificationSettings /></Layout></ProtectedRoute>} />
    <Route path="/settings/orders-payments" element={<ProtectedRoute><Layout><OrdersPayments /></Layout></ProtectedRoute>} />
    <Route path="/settings/support" element={<ProtectedRoute><Layout><Support /></Layout></ProtectedRoute>} />
    
    {/* Health & Fitness Tracking */}
    <Route path="/weight" element={<ProtectedRoute><Layout><Weight /></Layout></ProtectedRoute>} />
    <Route path="/water-intake" element={<ProtectedRoute><Layout><WaterIntake /></Layout></ProtectedRoute>} />
    <Route path="/sleep-tracking" element={<ProtectedRoute><Layout><SleepTracking /></Layout></ProtectedRoute>} />
    <Route path="/progress-photos" element={<ProtectedRoute><Layout><ProgressPhotos /></Layout></ProtectedRoute>} />
    <Route path="/body-measurements" element={<ProtectedRoute><Layout><BodyMeasurements /></Layout></ProtectedRoute>} />
    <Route path="/step-count" element={<ProtectedRoute><StepCount /></ProtectedRoute>} />
    <Route path="/symptoms" element={<ProtectedRoute><Layout><Symptoms /></Layout></ProtectedRoute>} />
    <Route path="/medical" element={<ProtectedRoute><Layout><MedicalHistory /></Layout></ProtectedRoute>} />
    
    {/* Nutrition */}
    <Route path="/food" element={<ProtectedRoute><Layout><Food /></Layout></ProtectedRoute>} />
    <Route path="/food/log" element={<ProtectedRoute><Layout><FoodLog /></Layout></ProtectedRoute>} />
    <Route path="/food/recipes" element={<ProtectedRoute><Layout><Recipes /></Layout></ProtectedRoute>} />
    <Route path="/meal-planner" element={<ProtectedRoute><Layout><MealPlanner /></Layout></ProtectedRoute>} />
    <Route path="/macros" element={<ProtectedRoute><Layout><MacrosDashboard /></Layout></ProtectedRoute>} />
    <Route path="/recipe/:recipeId" element={<ProtectedRoute><RecipeDetail /></ProtectedRoute>} />
    
    {/* Workouts & Training */}
    <Route path="/workout" element={<ProtectedRoute><Layout><Workout /></Layout></ProtectedRoute>} />
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
    <Route path="/calendar" element={<ProtectedRoute><Layout><EventCalendar /></Layout></ProtectedRoute>} />
    <Route path="/voice-notes" element={<ProtectedRoute><Layout><VoiceNotes /></Layout></ProtectedRoute>} />
    <Route path="/pwa-features" element={<ProtectedRoute><Layout><PWAFeatures /></Layout></ProtectedRoute>} />
    
    {/* 404 */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import Weight from "./pages/Weight";
import Food from "./pages/Food";
import FoodLog from "./pages/FoodLog";
import Recipes from "./pages/Recipes";
import Workout from "./pages/Workout";
import Activity from "./pages/Activity";
import Habits from "./pages/Habits";
import Supplements from "./pages/Supplements";
import IntervalTimer from "./pages/IntervalTimer";
import Symptoms from "./pages/Symptoms";
import MedicalHistory from "./pages/MedicalHistory";
import AIInsights from "./pages/AIInsights";
import Socials from "./pages/Socials";
import Referral from "./pages/Referral";
import FitnessGoals from "./pages/FitnessGoals";
import Achievements from "./pages/Achievements";
import StepCount from "./pages/StepCount";
import Onboarding from "./pages/Onboarding";
import PrivacySecurity from "./pages/PrivacySecurity";
import NotificationSettings from "./pages/NotificationSettings";
import OrdersPayments from "./pages/OrdersPayments";
import Support from "./pages/Support";
import SettingsMenu from "./pages/SettingsMenu";
import TrustedDevices from "./pages/TrustedDevices";
import WaterIntake from "./pages/WaterIntake";
import SleepTracking from "./pages/SleepTracking";
import ProgressPhotos from "./pages/ProgressPhotos";
import NotFound from "./pages/NotFound";
import BodyMeasurements from "./pages/BodyMeasurements";
import MealPlanner from "./pages/MealPlanner";
import MacrosDashboard from "./pages/MacrosDashboard";
import WorkoutPrograms from "./pages/WorkoutPrograms";
import TrainerMarketplace from "./pages/TrainerMarketplace";
import TrainerSetup from "./pages/TrainerSetup";
import CreatorHub from "./pages/CreatorHub";
import Discover from "./pages/Discover";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>} />
            <Route path="/weight" element={<ProtectedRoute><Layout><Weight /></Layout></ProtectedRoute>} />
            <Route path="/food" element={<ProtectedRoute><Layout><Food /></Layout></ProtectedRoute>} />
            <Route path="/food/log" element={<ProtectedRoute><Layout><FoodLog /></Layout></ProtectedRoute>} />
            <Route path="/food/recipes" element={<ProtectedRoute><Layout><Recipes /></Layout></ProtectedRoute>} />
            <Route path="/workout" element={<ProtectedRoute><Layout><Workout /></Layout></ProtectedRoute>} />
            <Route path="/activity" element={<ProtectedRoute><Layout><Activity /></Layout></ProtectedRoute>} />
            <Route path="/habits" element={<ProtectedRoute><Layout><Habits /></Layout></ProtectedRoute>} />
            <Route path="/supplements" element={<ProtectedRoute><Layout><Supplements /></Layout></ProtectedRoute>} />
            <Route path="/interval-timer" element={<ProtectedRoute><Layout><IntervalTimer /></Layout></ProtectedRoute>} />
            <Route path="/symptoms" element={<ProtectedRoute><Layout><Symptoms /></Layout></ProtectedRoute>} />
            <Route path="/medical" element={<ProtectedRoute><Layout><MedicalHistory /></Layout></ProtectedRoute>} />
            <Route path="/insights" element={<ProtectedRoute><Layout><AIInsights /></Layout></ProtectedRoute>} />
            <Route path="/socials" element={<ProtectedRoute><Layout><Socials /></Layout></ProtectedRoute>} />
            <Route path="/referral" element={<ProtectedRoute><Layout><Referral /></Layout></ProtectedRoute>} />
            <Route path="/fitness-goals" element={<ProtectedRoute><Layout><FitnessGoals /></Layout></ProtectedRoute>} />
            <Route path="/achievements" element={<ProtectedRoute><Layout><Achievements /></Layout></ProtectedRoute>} />
            <Route path="/step-count" element={<ProtectedRoute><StepCount /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Layout><SettingsMenu /></Layout></ProtectedRoute>} />
            <Route path="/settings/privacy-security" element={<ProtectedRoute><Layout><PrivacySecurity /></Layout></ProtectedRoute>} />
            <Route path="/settings/trusted-devices" element={<ProtectedRoute><Layout><TrustedDevices /></Layout></ProtectedRoute>} />
            <Route path="/settings/notifications" element={<ProtectedRoute><Layout><NotificationSettings /></Layout></ProtectedRoute>} />
            <Route path="/settings/orders-payments" element={<ProtectedRoute><Layout><OrdersPayments /></Layout></ProtectedRoute>} />
            <Route path="/settings/support" element={<ProtectedRoute><Layout><Support /></Layout></ProtectedRoute>} />
            <Route path="/water-intake" element={<ProtectedRoute><Layout><WaterIntake /></Layout></ProtectedRoute>} />
            <Route path="/sleep-tracking" element={<ProtectedRoute><Layout><SleepTracking /></Layout></ProtectedRoute>} />
            <Route path="/progress-photos" element={<ProtectedRoute><Layout><ProgressPhotos /></Layout></ProtectedRoute>} />
            <Route path="/body-measurements" element={<ProtectedRoute><Layout><BodyMeasurements /></Layout></ProtectedRoute>} />
            <Route path="/meal-planner" element={<ProtectedRoute><Layout><MealPlanner /></Layout></ProtectedRoute>} />
            <Route path="/macros" element={<ProtectedRoute><Layout><MacrosDashboard /></Layout></ProtectedRoute>} />
            <Route path="/workout-programs" element={<ProtectedRoute><Layout><WorkoutPrograms /></Layout></ProtectedRoute>} />
            <Route path="/trainer/marketplace" element={<ProtectedRoute><Layout><TrainerMarketplace /></Layout></ProtectedRoute>} />
            <Route path="/trainer/setup" element={<ProtectedRoute><Layout><TrainerSetup /></Layout></ProtectedRoute>} />
            <Route path="/creator/hub" element={<ProtectedRoute><Layout><CreatorHub /></Layout></ProtectedRoute>} />
            <Route path="/discover" element={<ProtectedRoute><Layout><Discover /></Layout></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

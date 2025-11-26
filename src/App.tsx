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
import NotFound from "./pages/NotFound";
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
            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>} />
            <Route path="/weight" element={<ProtectedRoute><Layout><Weight /></Layout></ProtectedRoute>} />
            <Route path="/food" element={<ProtectedRoute><Layout><Food /></Layout></ProtectedRoute>} />
            <Route path="/food/log" element={<ProtectedRoute><Layout><FoodLog /></Layout></ProtectedRoute>} />
            <Route path="/food/recipes" element={<ProtectedRoute><Layout><Recipes /></Layout></ProtectedRoute>} />
            <Route path="/recipes" element={<ProtectedRoute><Layout><Recipes /></Layout></ProtectedRoute>} />
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
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

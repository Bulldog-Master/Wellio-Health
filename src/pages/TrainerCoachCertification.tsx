import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { SEOHead } from "@/components/common";
import { SubscriptionGate } from "@/components/common";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle,
  Clock,
  Crown,
  GraduationCap,
  Lock,
  Play,
  Shield,
  Star,
  TrendingUp,
  Users,
  Video,
  Zap,
} from "lucide-react";

interface Module {
  id: string;
  title: string;
  description: string;
  duration: string;
  lessons: number;
  completed: boolean;
  locked: boolean;
}

const modules: Module[] = [
  {
    id: "fwi-fundamentals",
    title: "Functional Wellness Index (FWI)",
    description: "Understand how FWI combines sleep, meals, workouts, hydration, and mood into one actionable score.",
    duration: "15 min",
    lessons: 4,
    completed: false,
    locked: false,
  },
  {
    id: "habit-coaching",
    title: "Habit Adherence Coaching",
    description: "Learn to identify patterns, support client consistency, and address adherence challenges.",
    duration: "20 min",
    lessons: 5,
    completed: false,
    locked: false,
  },
  {
    id: "trend-signals",
    title: "Reading Trend Signals",
    description: "Master 14-day and 30-day trend analysis to spot improvements and warning signs early.",
    duration: "15 min",
    lessons: 4,
    completed: false,
    locked: true,
  },
  {
    id: "privacy-first",
    title: "Privacy-First Coaching",
    description: "Understand what data you see vs. what stays private, and how to communicate this to clients.",
    duration: "10 min",
    lessons: 3,
    completed: false,
    locked: true,
  },
];

const benefits = [
  {
    icon: Award,
    title: "Certified Badge",
    description: "Display your Wellio Certified Coach badge on your profile",
  },
  {
    icon: Users,
    title: "Directory Listing",
    description: "Get featured in the Wellio Coach Directory for client matchmaking",
  },
  {
    icon: Star,
    title: "Priority Support",
    description: "Access dedicated support for certified professionals",
  },
  {
    icon: Zap,
    title: "Early Features",
    description: "Be first to access new coaching tools and features",
  },
];

const TrainerCoachCertification = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(["professional", "common"]);
  const [activeModule, setActiveModule] = useState<string | null>(null);

  const completedCount = modules.filter(m => m.completed).length;
  const progressPercent = (completedCount / modules.length) * 100;

  return (
    <SubscriptionGate feature="trainer_certification">
      <SEOHead
        titleKey="seo:certification_title"
        descriptionKey="seo:certification_description"
      />

      <div className="min-h-screen bg-background">
        <div className="container max-w-5xl py-8 px-4">
          {/* Header */}
          <Button
            variant="ghost"
            onClick={() => navigate("/for-professionals")}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t("common:back")}
          </Button>

          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4 inline-flex items-center gap-1">
              <Crown className="w-3 h-3" />
              {t("certification_program")}
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {t("wellio_coach_certification")}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t("certification_description")}
            </p>
          </div>

          {/* Progress Overview */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <GraduationCap className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{t("your_progress")}</h3>
                    <p className="text-sm text-muted-foreground">
                      {completedCount} / {modules.length} {t("modules_completed")}
                    </p>
                  </div>
                </div>
                <div className="w-full md:w-64">
                  <Progress value={progressPercent} className="h-3" />
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>~1 {t("hour_total")}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Course Modules */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-primary" />
              {t("course_modules")}
            </h2>

            <div className="space-y-4">
              {modules.map((module, index) => (
                <Card
                  key={module.id}
                  className={`transition-all ${
                    module.locked
                      ? "opacity-60"
                      : "hover:shadow-lg hover:border-primary/30 cursor-pointer"
                  } ${activeModule === module.id ? "border-primary" : ""}`}
                  onClick={() => !module.locked && setActiveModule(module.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Module Number */}
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                          module.completed
                            ? "bg-green-500/10 text-green-500"
                            : module.locked
                            ? "bg-muted text-muted-foreground"
                            : "bg-primary/10 text-primary"
                        }`}
                      >
                        {module.completed ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : module.locked ? (
                          <Lock className="h-5 w-5" />
                        ) : (
                          <span className="font-bold">{index + 1}</span>
                        )}
                      </div>

                      {/* Module Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg">{module.title}</h3>
                          {module.completed && (
                            <Badge variant="secondary" className="text-green-500">
                              {t("common:completed")}
                            </Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground text-sm mb-3">
                          {module.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {module.duration}
                          </span>
                          <span className="flex items-center gap-1">
                            <Video className="h-3 w-3" />
                            {module.lessons} {t("lessons")}
                          </span>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="shrink-0">
                        {module.locked ? (
                          <Button variant="ghost" size="sm" disabled>
                            <Lock className="h-4 w-4" />
                          </Button>
                        ) : module.completed ? (
                          <Button variant="outline" size="sm">
                            {t("review")}
                          </Button>
                        ) : (
                          <Button size="sm">
                            <Play className="h-4 w-4 mr-1" />
                            {t("start")}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Benefits */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Award className="h-6 w-6 text-primary" />
              {t("certification_benefits")}
            </h2>

            <div className="grid sm:grid-cols-2 gap-4">
              {benefits.map((benefit, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <benefit.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">{benefit.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {benefit.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* What You'll Learn */}
          <Card className="mb-12 border-2 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-primary" />
                {t("what_youll_learn")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  t("learn_fwi_interpretation"),
                  t("learn_adherence_patterns"),
                  t("learn_trend_analysis"),
                  t("learn_privacy_communication"),
                  t("learn_remote_coaching"),
                  t("learn_client_engagement"),
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* CTA */}
          <Card className="bg-gradient-to-br from-primary/10 via-background to-accent/10 border-2 border-primary/30">
            <CardContent className="p-8 text-center">
              <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">{t("ready_to_certify")}</h2>
              <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
                {t("certification_cta_description")}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="text-lg px-8">
                  {t("start_certification")}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <a href="/for-professionals">{t("learn_more")}</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </SubscriptionGate>
  );
};

export default TrainerCoachCertification;

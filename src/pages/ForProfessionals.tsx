import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SEOHead } from "@/components/common";
import {
  Shield,
  TrendingUp,
  Video,
  MessageSquare,
  Users,
  Lock,
  Zap,
  Heart,
  ArrowRight,
  CheckCircle,
  Stethoscope,
  Dumbbell,
} from "lucide-react";

const ForProfessionals = () => {
  const { t } = useTranslation(["professional", "common"]);

  return (
    <>
      <SEOHead
        titleKey="seo:for_professionals_title"
        descriptionKey="seo:for_professionals_description"
      />

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative py-20 px-4 md:px-8 lg:px-16 bg-gradient-to-br from-primary/10 via-background to-accent/10">
          <div className="max-w-5xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Professional-Grade Coaching & Clinical Insight
              <span className="block text-primary mt-2">Without Compromising Privacy</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Wellio gives you functional wellness signals, trend insights, and secure communication — 
              without exposing your clients' identities, raw logs, or medical history.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link to="/auth">
                  Get Started as a Professional
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="mailto:demo@wellio.app">Book a Demo</a>
              </Button>
            </div>
          </div>
        </section>

        {/* Why Professionals Choose Wellio */}
        <section className="py-16 px-4 md:px-8 lg:px-16">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Why Professionals Choose Wellio
            </h2>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Coaches Card */}
              <Card className="border-2 border-primary/20 hover:border-primary/40 transition-colors">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 rounded-xl bg-primary/10">
                      <Dumbbell className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold">Coaches</h3>
                  </div>
                  <p className="text-lg font-medium text-primary mb-4">
                    Better results. Stronger retention. Zero liability.
                  </p>
                  <ul className="space-y-3">
                    {[
                      "See a client's daily Functional Wellness Index (FWI)",
                      "Track adherence across meals, workouts, hydration, sleep, mood",
                      "Deliver personalized adjustments based on trend changes",
                      "Use encrypted messaging and integrated live video sessions",
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-muted-foreground">
                        <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-6 text-sm italic text-muted-foreground border-l-2 border-primary pl-4">
                    "I'm a data-driven coach — powered by quantum-private tech."
                  </p>
                </CardContent>
              </Card>

              {/* Clinicians Card */}
              <Card className="border-2 border-accent/20 hover:border-accent/40 transition-colors">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 rounded-xl bg-accent/10">
                      <Stethoscope className="h-8 w-8 text-accent-foreground" />
                    </div>
                    <h3 className="text-2xl font-bold">Clinicians</h3>
                  </div>
                  <p className="text-lg font-medium text-accent-foreground mb-4">
                    A low-risk way to understand what happens between visits.
                  </p>
                  <ul className="space-y-3">
                    {[
                      "View high-level functional trends (not PHI)",
                      "Support health behavior change securely",
                      "Use encrypted clinician–patient messaging",
                      "No raw logs. No medical documents. No compliance burden.",
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-muted-foreground">
                        <CheckCircle className="h-5 w-5 text-accent-foreground shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-6 text-sm italic text-muted-foreground border-l-2 border-accent pl-4">
                    "Clinical relevance without clinical liability."
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Privacy & Security Section */}
        <section className="py-16 px-4 md:px-8 lg:px-16 bg-muted/30">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
              Built for Privacy — Designed for Outcomes
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              Your clients keep their meal logs, workout notes, journals, and medical documents fully private.
            </p>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: Shield,
                  title: "Zero Raw Data",
                  desc: "Professionals see derived signals only — never raw logs or documents.",
                },
                {
                  icon: Lock,
                  title: "Post-Quantum Encryption",
                  desc: "Secure messaging uses ML-KEM-768 + AES-256-GCM.",
                },
                {
                  icon: Zap,
                  title: "Metadata Protection",
                  desc: "cMixx routing shields even communication patterns from analysis.",
                },
                {
                  icon: Users,
                  title: "User-Controlled Access",
                  desc: "Clients control exactly who sees what — and can revoke anytime.",
                },
              ].map((feature, i) => (
                <Card key={i} className="text-center">
                  <CardContent className="p-6">
                    <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Simple Onboarding */}
        <section className="py-16 px-4 md:px-8 lg:px-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Simple Onboarding
            </h2>

            <div className="space-y-6">
              {[
                { step: 1, title: "Create a pro account", desc: "Sign up and verify your professional credentials." },
                { step: 2, title: "Generate your invite code", desc: "Get a unique code to share with clients or patients." },
                { step: 3, title: "Share it with clients", desc: "They enter the code from their Care Team screen." },
                { step: 4, title: "Accept the connection", desc: "Review and approve incoming relationship requests." },
                { step: 5, title: "See FWI trends instantly", desc: "Access functional wellness insights and trend data." },
              ].map((item) => (
                <div key={item.step} className="flex items-start gap-4">
                  <div className="shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-center mt-8 text-muted-foreground">
              No PHI, no forms, no setup headaches.
            </p>
          </div>
        </section>

        {/* Professional Tools */}
        <section className="py-16 px-4 md:px-8 lg:px-16 bg-muted/30">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Professional Tools
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Video,
                  title: "Live Video Sessions",
                  desc: "Host sessions directly inside the platform — view them alongside trend changes.",
                },
                {
                  icon: TrendingUp,
                  title: "Client Growth Dashboard",
                  desc: "Track new connections, session history, trend improvements, and client outcomes.",
                },
                {
                  icon: MessageSquare,
                  title: "PQ-Secure Messaging",
                  desc: "End-to-end encrypted with cMixx routing for metadata privacy.",
                },
              ].map((tool, i) => (
                <Card key={i}>
                  <CardContent className="p-6 text-center">
                    <div className="mx-auto w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <tool.icon className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{tool.title}</h3>
                    <p className="text-sm text-muted-foreground">{tool.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Preview */}
        <section className="py-16 px-4 md:px-8 lg:px-16">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Pricing That Grows With You
            </h2>

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <Card>
                <CardContent className="p-6">
                  <Dumbbell className="h-8 w-8 text-primary mx-auto mb-4" />
                  <h3 className="font-bold text-lg mb-2">Coaches</h3>
                  <p className="text-muted-foreground text-sm">
                    Free tier → Pro tier ($29–49/mo) → Team tier ($99–249)
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <Stethoscope className="h-8 w-8 text-primary mx-auto mb-4" />
                  <h3 className="font-bold text-lg mb-2">Clinicians</h3>
                  <p className="text-muted-foreground text-sm">
                    Individual → Group Practice → Enterprise integrations
                  </p>
                </CardContent>
              </Card>
            </div>

            <p className="text-muted-foreground">
              Ask us about revenue sharing and volume discounts.
            </p>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 px-4 md:px-8 lg:px-16 bg-gradient-to-br from-primary/10 via-background to-accent/10">
          <div className="max-w-3xl mx-auto text-center">
            <Heart className="h-12 w-12 text-primary mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Become a privacy-first professional.
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Grow your practice the modern way.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link to="/auth">
                  Join Wellio as a Professional
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="mailto:demo@wellio.app">Request a Live Demo</a>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default ForProfessionals;

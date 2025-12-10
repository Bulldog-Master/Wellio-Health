import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SEOHead } from "@/components/common";
import {
  Shield,
  TrendingUp,
  Brain,
  Users,
  Lock,
  Zap,
  Heart,
  ArrowRight,
  CheckCircle,
  Stethoscope,
  Dumbbell,
  Activity,
  Globe,
  Smartphone,
  Eye,
  EyeOff,
  MessageSquare,
  Video,
} from "lucide-react";

const Landing = () => {
  const { t } = useTranslation(["common", "subscription"]);

  return (
    <>
      <SEOHead
        titleKey="seo:landing_title"
        descriptionKey="seo:landing_description"
      />

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative py-20 px-4 md:px-8 lg:px-16 overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
          
          {/* Animated circles */}
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000" />
          
          <div className="relative max-w-6xl mx-auto text-center">
            {/* Trust badges */}
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              <Badge variant="outline" className="px-3 py-1 text-xs">
                <Shield className="h-3 w-3 mr-1" />
                Post-Quantum Encryption
              </Badge>
              <Badge variant="outline" className="px-3 py-1 text-xs">
                <Lock className="h-3 w-3 mr-1" />
                cMixx Metadata Protection
              </Badge>
              <Badge variant="outline" className="px-3 py-1 text-xs">
                <Globe className="h-3 w-3 mr-1" />
                23 Languages
              </Badge>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              AI-Powered Wellness.
              <span className="block text-primary mt-2">Quantum-Private by Design.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Wellio is a privacy-first Wellness APP Platform for individuals, with optional support 
              from trainers, coaches, and clinicians. Raw data stays on your device — only derived 
              wellness insights can be shared, if you choose.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8" asChild>
                <Link to="/auth">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8" asChild>
                <Link to="/for-professionals">
                  For Professionals
                </Link>
              </Button>
            </div>

            {/* Stats bar */}
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {[
                { value: "100/100", label: "Security Rating" },
                { value: "23", label: "Languages Supported" },
                { value: "0", label: "Data We Can See" },
                { value: "∞", label: "Your Privacy" },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-primary">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Wellio Section */}
        <section className="py-20 px-4 md:px-8 lg:px-16 bg-muted/30">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Why Wellio?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Four pillars that make this Wellness APP Platform fundamentally different.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: Brain,
                  title: "Personal AI Coach",
                  desc: "AI-powered insights that understand your patterns. Voice coaching, injury prevention, and personalized recommendations.",
                  color: "text-primary",
                },
                {
                  icon: Shield,
                  title: "Privacy-First",
                  desc: "Post-quantum encryption protects your data today and tomorrow. Raw logs never leave your device.",
                  color: "text-green-500",
                },
                {
                  icon: Activity,
                  title: "Daily Action Engine",
                  desc: "Your Functional Wellness Index (FWI) combines sleep, meals, workouts, hydration, and mood into one actionable score.",
                  color: "text-blue-500",
                },
                {
                  icon: Globe,
                  title: "Global Accessibility",
                  desc: "Available in 23 languages. Track in your native language. Share with professionals worldwide.",
                  color: "text-purple-500",
                },
              ].map((pillar, i) => (
                <Card key={i} className="relative overflow-hidden group hover:shadow-lg transition-all">
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 rounded-xl bg-background flex items-center justify-center mb-4 ${pillar.color}`}>
                      <pillar.icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{pillar.title}</h3>
                    <p className="text-sm text-muted-foreground">{pillar.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Your Daily Wellness Command Center */}
        <section className="py-20 px-4 md:px-8 lg:px-16">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Your Daily Wellness Command Center
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Everything you need to improve your health, all in one quantum-private APP Platform.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: Dumbbell, title: "Workout Tracking", desc: "Log workouts, programs, personal records, and live sessions" },
                { icon: Heart, title: "Nutrition & Meals", desc: "Food logging, meal planning, recipes, and grocery lists" },
                { icon: Activity, title: "Sleep & Recovery", desc: "Sleep tracking, recovery insights, and circadian optimization" },
                { icon: TrendingUp, title: "Habits & Goals", desc: "Daily habits, goal setting, and progress tracking" },
                { icon: Brain, title: "AI Insights", desc: "Personalized recommendations and injury prevention" },
                { icon: MessageSquare, title: "Secure Messaging", desc: "E2E encrypted chat with metadata protection" },
                { icon: Video, title: "Live Sessions", desc: "Video coaching with professionals" },
                { icon: Users, title: "Care Team", desc: "Connect with coaches and clinicians" },
                { icon: Lock, title: "Medical Vault", desc: "Encrypted storage for health records" },
              ].map((feature, i) => (
                <div key={i} className="flex items-start gap-4 p-4 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Privacy Comparison */}
        <section className="py-20 px-4 md:px-8 lg:px-16 bg-muted/30">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                What You Share vs. What You Keep
              </h2>
              <p className="text-lg text-muted-foreground">
                Wellio is designed for privacy by default.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* What stays private */}
              <Card className="border-green-500/30">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-green-500/10">
                      <EyeOff className="h-6 w-6 text-green-500" />
                    </div>
                    <h3 className="text-xl font-bold">Always Private</h3>
                  </div>
                  <ul className="space-y-3">
                    {[
                      "Raw meal logs and food photos",
                      "Workout notes and personal journals",
                      "Medical documents and test results",
                      "Message content (E2E encrypted)",
                      "Communication metadata (cMixx protected)",
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-muted-foreground">
                        <Lock className="h-4 w-4 text-green-500 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* What you can share */}
              <Card className="border-primary/30">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Eye className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold">Optional Sharing</h3>
                  </div>
                  <ul className="space-y-3">
                    {[
                      "Functional Wellness Index (FWI score)",
                      "Trend lines (14/30-day patterns)",
                      "Adherence metrics (workout, sleep, hydration)",
                      "Risk alerts (with your permission)",
                      "Secure messages to your Care Team",
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-muted-foreground">
                        <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* For Professionals Preview */}
        <section className="py-20 px-4 md:px-8 lg:px-16">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Optional Professional Extensions
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Trainers, coaches, and clinicians get powerful tools without the compliance burden.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <Card className="border-2 border-primary/20 hover:border-primary/40 transition-colors">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-primary/10">
                      <Dumbbell className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold">Trainers & Coaches</h3>
                  </div>
                  <p className="text-muted-foreground mb-4">
                    See FWI trends, adherence patterns, and deliver personalized coaching — 
                    without ever seeing raw logs or personal notes.
                  </p>
                  <Button variant="outline" asChild>
                    <Link to="/for-professionals">
                      Learn More
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-2 border-accent/20 hover:border-accent/40 transition-colors">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-accent/10">
                      <Stethoscope className="h-8 w-8 text-accent-foreground" />
                    </div>
                    <h3 className="text-2xl font-bold">Clinicians</h3>
                  </div>
                  <p className="text-muted-foreground mb-4">
                    Functional insights without PHI. Understand what happens between visits 
                    with zero compliance burden.
                  </p>
                  <Button variant="outline" asChild>
                    <Link to="/for-professionals">
                      Learn More
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Security Section */}
        <section className="py-20 px-4 md:px-8 lg:px-16 bg-gradient-to-br from-background via-primary/5 to-background">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <Badge variant="secondary" className="mb-4">
                100/100 Security Rating
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Security You Can Trust
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Built with post-quantum cryptography and zero-trust architecture.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  title: "Post-Quantum Encryption",
                  desc: "ML-KEM-768 protects your data from future quantum attacks.",
                  icon: Shield,
                },
                {
                  title: "Metadata Protection",
                  desc: "cMixx mixnet routing makes communication patterns invisible.",
                  icon: Lock,
                },
                {
                  title: "Zero-Knowledge Design",
                  desc: "The server never sees your raw data — only encrypted ciphertext.",
                  icon: EyeOff,
                },
                {
                  title: "E2E Encrypted Messages",
                  desc: "AES-256-GCM encryption with perfect forward secrecy.",
                  icon: MessageSquare,
                },
                {
                  title: "Medical-Grade Storage",
                  desc: "HIPAA-ready encrypted vault for health records.",
                  icon: Heart,
                },
                {
                  title: "Continuous Scanning",
                  desc: "CodeQL and Snyk monitor for vulnerabilities 24/7.",
                  icon: Zap,
                },
              ].map((feature, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <feature.icon className="h-8 w-8 text-primary mb-4" />
                    <h3 className="font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Preview */}
        <section className="py-20 px-4 md:px-8 lg:px-16">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Choose Your Plan
              </h2>
              <p className="text-lg text-muted-foreground">
                Start free. Upgrade when you're ready.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Free */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-2">Free</h3>
                  <div className="text-3xl font-bold mb-4">$0<span className="text-base font-normal text-muted-foreground">/month</span></div>
                  <ul className="space-y-2 mb-6">
                    {["Basic tracking", "FWI score", "7-day history", "Community access"].map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-primary" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/auth">Get Started</Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Pro */}
              <Card className="border-2 border-primary relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge>Most Popular</Badge>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-2">Pro</h3>
                  <div className="text-3xl font-bold mb-4">$9.99<span className="text-base font-normal text-muted-foreground">/month</span></div>
                  <ul className="space-y-2 mb-6">
                    {["Everything in Free", "AI coaching", "Unlimited history", "Care Team access", "Medical vault", "Priority support"].map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-primary" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full" asChild>
                    <Link to="/auth">Start Free Trial</Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Enterprise */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-2">Enterprise</h3>
                  <div className="text-3xl font-bold mb-4">Custom</div>
                  <ul className="space-y-2 mb-6">
                    {["Everything in Pro", "Team management", "SSO integration", "API access", "Dedicated support", "Custom contracts"].map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-primary" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Button variant="outline" className="w-full" asChild>
                    <a href="mailto:enterprise@wellio.app">Contact Sales</a>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 px-4 md:px-8 lg:px-16 bg-gradient-to-br from-primary/10 via-background to-accent/10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Wellness Without Surveillance
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands who are taking control of their health — without giving up their privacy.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8" asChild>
                <Link to="/auth">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              No credit card required. Cancel anytime.
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-4 md:px-8 lg:px-16 border-t">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <h4 className="font-bold mb-4">Wellio</h4>
                <p className="text-sm text-muted-foreground">
                  AI-powered wellness. Quantum-private by design.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Product</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><Link to="/for-professionals" className="hover:text-foreground">For Professionals</Link></li>
                  <li><Link to="/subscription" className="hover:text-foreground">Pricing</Link></li>
                  <li><Link to="/auth" className="hover:text-foreground">Get Started</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Legal</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><Link to="/privacy-policy" className="hover:text-foreground">Privacy Policy</Link></li>
                  <li><Link to="/terms" className="hover:text-foreground">Terms of Service</Link></li>
                  <li><Link to="/accessibility-statement" className="hover:text-foreground">Accessibility</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Security</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><a href="https://github.com" className="hover:text-foreground">Security Whitepaper</a></li>
                  <li><Link to="/privacy-security" className="hover:text-foreground">Security FAQ</Link></li>
                </ul>
              </div>
            </div>
            <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
              © {new Date().getFullYear()} Wellio Health. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Landing;

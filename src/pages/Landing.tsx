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
                Post-Quantum Encryption (ML-KEM-768)
              </Badge>
              <Badge variant="outline" className="px-3 py-1 text-xs">
                <Lock className="h-3 w-3 mr-1" />
                Metadata Protection (cMixx)
              </Badge>
              <Badge variant="outline" className="px-3 py-1 text-xs">
                <Zap className="h-3 w-3 mr-1" />
                Zero-Trust Architecture
              </Badge>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              Wellio — A Privacy-First
              <span className="block text-primary mt-2">Wellness APP Platform</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Track your wellbeing privately. Connect with a trainer, coach, or clinician only if you choose.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8" asChild>
                <Link to="/auth">
                  Get the APP
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8" asChild>
                <Link to="/for-professionals">
                  How Professionals Connect
                  <ArrowRight className="ml-2 h-4 w-4" />
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

        {/* What is Wellio */}
        <section className="py-20 px-4 md:px-8 lg:px-16 bg-muted/30">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                A Wellness APP Platform Designed Around You
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Wellio gives individuals a private, AI-powered way to understand their wellbeing 
                through daily habit tracking, the Functional Wellness Index, and privacy-safe insights.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: TrendingUp, title: "FWI — Your Private Wellness Score", desc: "A daily score reflecting your sleep, meals, movement, hydration, and mood" },
                { icon: Activity, title: "Today at a Glance Dashboard", desc: "See your wellness status and daily actions at a glance" },
                { icon: Heart, title: "Wellness Logs", desc: "Track sleep, meals, hydration, movement, and mood privately" },
                { icon: Lock, title: "Private Journal & Medical Vault", desc: "Encrypted storage for journals and sensitive health information" },
                { icon: Brain, title: "AI Wellness Guidance", desc: "Personalized insights and recommendations powered by AI" },
                { icon: MessageSquare, title: "Secure Messaging & Video", desc: "E2E encrypted communication with optional video sessions" },
              ].map((feature, i) => (
                <Card key={i} className="relative overflow-hidden group hover:shadow-lg transition-all">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FWI Section */}
        <section className="py-20 px-4 md:px-8 lg:px-16">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <Badge variant="secondary" className="mb-4">Your Private Score</Badge>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Your Daily FWI Score
                </h2>
                <p className="text-lg text-muted-foreground mb-6">
                  FWI combines multiple wellness inputs into one private daily metric:
                </p>
                <ul className="space-y-3 mb-6">
                  {[
                    "Sleep patterns",
                    "Meals & hydration",
                    "Movement & recovery",
                    "Mood & stress",
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-muted-foreground">
                  FWI helps you understand how your choices shape your day — without sending raw data anywhere.
                </p>
              </div>
              <div className="relative">
                <div className="aspect-square bg-gradient-to-br from-primary/20 via-primary/10 to-transparent rounded-3xl flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-7xl font-bold text-primary mb-2">87</div>
                    <div className="text-xl text-muted-foreground">Today's FWI</div>
                    <div className="flex items-center justify-center gap-2 mt-2 text-green-500">
                      <TrendingUp className="h-5 w-5" />
                      <span className="text-sm">+3 from yesterday</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How the APP Platform Works */}
        <section className="py-20 px-4 md:px-8 lg:px-16 bg-muted/30">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                How the APP Platform Works
              </h2>
            </div>

            {/* Individuals - Primary Users */}
            <Card className="mb-8 border-2 border-primary/30">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <Smartphone className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold">Individuals (Primary Users)</h3>
                </div>
                <p className="text-lg text-muted-foreground">
                  You use Wellio independently. All data stays on your device.
                </p>
              </CardContent>
            </Card>

            {/* Optional Professional Extensions */}
            <div className="text-center mb-6">
              <Badge variant="outline" className="text-base px-4 py-2">Optional Professional Extensions</Badge>
            </div>
            <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
              You may invite a trainer/coach or clinician to view high-level derived signals. 
              They cannot access raw logs or personal data.
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Trainers & Coaches */}
              <Card className="border border-primary/20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Dumbbell className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold">Trainers & Coaches</h3>
                  </div>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-primary shrink-0" /> Trend visibility
                    </li>
                    <li className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-primary shrink-0" /> FWI guidance
                    </li>
                    <li className="flex items-center gap-2">
                      <EyeOff className="h-4 w-4 text-destructive shrink-0" /> No meal journals
                    </li>
                    <li className="flex items-center gap-2">
                      <EyeOff className="h-4 w-4 text-destructive shrink-0" /> No personal notes
                    </li>
                    <li className="flex items-center gap-2">
                      <EyeOff className="h-4 w-4 text-destructive shrink-0" /> No metadata
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Clinicians */}
              <Card className="border border-accent/20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-accent/10">
                      <Stethoscope className="h-6 w-6 text-accent-foreground" />
                    </div>
                    <h3 className="text-xl font-bold">Clinicians</h3>
                  </div>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-primary shrink-0" /> Functional patterns only
                    </li>
                    <li className="flex items-center gap-2">
                      <EyeOff className="h-4 w-4 text-destructive shrink-0" /> No PHI exposure
                    </li>
                    <li className="flex items-center gap-2">
                      <EyeOff className="h-4 w-4 text-destructive shrink-0" /> No vault access
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary shrink-0" /> Reduced compliance overhead
                    </li>
                    <li className="flex items-center gap-2">
                      <Lock className="h-4 w-4 text-primary shrink-0" /> Secure, PQ-protected communication
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Privacy & Security Section */}
        <section className="py-20 px-4 md:px-8 lg:px-16 bg-gradient-to-br from-background via-primary/5 to-background">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Privacy Is the Foundation of the APP Platform
              </h2>
            </div>

            <div className="grid sm:grid-cols-3 gap-8">
              <Card className="text-center">
                <CardContent className="p-8">
                  <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">Post-Quantum Encryption</h3>
                  <p className="text-sm text-muted-foreground">
                    ML-KEM-768 protects your data today and against future quantum threats.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="p-8">
                  <Lock className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">Metadata Protection</h3>
                  <p className="text-sm text-muted-foreground">
                    cMixx eliminates sender-receiver linkage and timing correlations.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="p-8">
                  <EyeOff className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">Zero-Trust Storage</h3>
                  <p className="text-sm text-muted-foreground">
                    Raw logs never leave your device. Wellio servers cannot access user data.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Why Professionals Use Wellio */}
        <section className="py-20 px-4 md:px-8 lg:px-16">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Why Professionals Use Wellio
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Professionals use the APP Platform as an extension, not a workspace.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <Card>
                <CardContent className="p-8">
                  <Dumbbell className="h-10 w-10 text-primary mb-4" />
                  <h3 className="text-xl font-bold mb-4">Trainers & Coaches</h3>
                  <ul className="space-y-3 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>Support clients who already use Wellio</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>View high-level wellness signals</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>Conduct secure sessions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>Never access private logs</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-8">
                  <Stethoscope className="h-10 w-10 text-primary mb-4" />
                  <h3 className="text-xl font-bold mb-4">Clinicians</h3>
                  <ul className="space-y-3 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>View functional behavioral patterns</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>Stay outside PHI exposure</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>Avoid HIPAA storage burdens</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>Do NOT treat or diagnose within the platform</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <div className="text-center mt-8">
              <Button size="lg" variant="outline" asChild>
                <Link to="/for-professionals">
                  Learn More for Professionals
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 px-4 md:px-8 lg:px-16 bg-muted/30">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              What People Are Saying
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  quote: "My clients use Wellio, and it gives me trend visibility without invading privacy.",
                  author: "Professional Trainer",
                },
                {
                  quote: "I support lifestyle changes without storing or seeing PHI.",
                  author: "Clinician, Functional Medicine",
                },
                {
                  quote: "The only wellness APP Platform I trust with sensitive data.",
                  author: "Individual User",
                },
              ].map((testimonial, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <p className="text-muted-foreground italic mb-4">"{testimonial.quote}"</p>
                    <p className="text-sm font-medium">— {testimonial.author}</p>
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
                    {["FWI tracking", "Basic logging", "7-day history", "Community access"].map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="h-4 w-4 text-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full" variant="outline" asChild>
                    <Link to="/auth">Get Started</Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Plus */}
              <Card className="border-2 border-primary relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge>Most Popular</Badge>
                </div>
                <CardContent className="p-6 pt-8">
                  <h3 className="text-xl font-bold mb-2">Plus</h3>
                  <div className="text-3xl font-bold mb-4">$9.99<span className="text-base font-normal text-muted-foreground">/month</span></div>
                  <ul className="space-y-2 mb-6">
                    {["Everything in Free", "Unlimited history", "AI insights", "Medical vault", "Care Team connections"].map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="h-4 w-4 text-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full" asChild>
                    <Link to="/auth">Start Free Trial</Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Professional */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-2">Professional</h3>
                  <div className="text-3xl font-bold mb-4">$29<span className="text-base font-normal text-muted-foreground">/month</span></div>
                  <ul className="space-y-2 mb-6">
                    {["Everything in Plus", "Client management", "Video sessions", "Analytics dashboard", "Priority support"].map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="h-4 w-4 text-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full" variant="outline" asChild>
                    <Link to="/for-professionals">Learn More</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 px-4 md:px-8 lg:px-16 bg-muted/30">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Frequently Asked Questions
            </h2>

            <div className="space-y-6">
              {[
                {
                  q: "Is Wellio a coaching platform?",
                  a: "No. Wellio is a Wellness APP Platform for individuals. Professionals can connect only when invited by the user.",
                },
                {
                  q: "Is Wellio a medical platform?",
                  a: "No. Clinicians see functional signals only — no PHI. They do not treat or diagnose within the platform.",
                },
                {
                  q: "Why 'APP Platform'?",
                  a: "Because Wellio supports multiple user types (individuals, trainers/coaches, clinicians) with shared infrastructure and privacy guarantees — more than a standalone app.",
                },
                {
                  q: "Can professionals see my raw data?",
                  a: "Never. Professionals only see derived wellness signals like FWI and trends. Raw logs, journals, and notes stay private.",
                },
              ].map((faq, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-2">{faq.q}</h3>
                    <p className="text-muted-foreground">{faq.a}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 px-4 md:px-8 lg:px-16">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Wellness Without Surveillance
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join the privacy-first Wellness APP Platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8" asChild>
                <Link to="/auth">
                  Get the APP
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8" asChild>
                <Link to="/for-professionals">
                  For Professionals
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Landing;

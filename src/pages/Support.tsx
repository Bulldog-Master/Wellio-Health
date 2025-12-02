import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail, MessageCircle, Book, HelpCircle, Sparkles } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const Support = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('settings');

  const faqs = [
    { question: t('faq_getting_started_q'), answer: t('faq_getting_started_a') },
    { question: t('faq_track_workouts_q'), answer: t('faq_track_workouts_a') },
    { question: t('faq_log_meals_q'), answer: t('faq_log_meals_a') },
    { question: t('faq_vip_benefits_q'), answer: t('faq_vip_benefits_a') },
    { question: t('faq_earn_points_q'), answer: t('faq_earn_points_a') },
    { question: t('faq_connect_friends_q'), answer: t('faq_connect_friends_a') },
    { question: t('faq_live_sessions_q'), answer: t('faq_live_sessions_a') },
    { question: t('faq_data_privacy_q'), answer: t('faq_data_privacy_a') },
  ];

  const appTips = [
    { title: t('tip_dashboard_title'), description: t('tip_dashboard_desc'), icon: "📊" },
    { title: t('tip_quick_actions_title'), description: t('tip_quick_actions_desc'), icon: "⚡" },
    { title: t('tip_streaks_title'), description: t('tip_streaks_desc'), icon: "🔥" },
    { title: t('tip_social_title'), description: t('tip_social_desc'), icon: "👥" },
  ];

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/settings")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold mb-2">{t('support_title')}</h1>
          <p className="text-muted-foreground">{t('support_subtitle')}</p>
        </div>
      </div>

      {/* Contact Options */}
      <div className="grid gap-4">
        <Card className="p-6 hover:bg-accent/50 transition-colors cursor-pointer">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Book className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">{t('help_center')}</h3>
              <p className="text-sm text-muted-foreground">{t('help_center_desc')}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:bg-accent/50 transition-colors cursor-pointer">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-secondary/10 rounded-lg">
              <MessageCircle className="w-6 h-6 text-secondary" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">{t('live_chat')}</h3>
              <p className="text-sm text-muted-foreground">{t('live_chat_desc')}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:bg-accent/50 transition-colors cursor-pointer">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-accent/10 rounded-lg">
              <Mail className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">{t('email_support')}</h3>
              <p className="text-sm text-muted-foreground">{t('email_support_desc')}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* App Tips Section */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-xl font-semibold">{t('getting_most_title')}</h2>
        </div>
        <p className="text-muted-foreground mb-4">{t('getting_most_desc')}</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {appTips.map((tip, index) => (
            <div key={index} className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{tip.icon}</span>
                <h3 className="font-medium">{tip.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground">{tip.description}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* FAQ Section */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <HelpCircle className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-xl font-semibold">{t('faq_title')}</h2>
        </div>
        <p className="text-muted-foreground mb-4">{t('faq_subtitle')}</p>
        
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Card>
    </div>
  );
};

export default Support;

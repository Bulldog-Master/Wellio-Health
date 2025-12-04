import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronRight, Dumbbell, Stethoscope, Crown } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import { SubscriptionGate } from "@/components/SubscriptionGate";

const ProfessionalHub = () => {
  const navigate = useNavigate();
  const { hasFullAccess, isVIP, isAdmin } = useSubscription();
  const { t } = useTranslation(['professional', 'common']);

  const portalItems = [
    {
      title: t('trainer_portal'),
      description: t('trainer_portal_desc'),
      icon: Dumbbell,
      iconBg: "bg-orange-500/20",
      iconColor: "text-orange-500",
      path: "/trainer-portal",
    },
    {
      title: t('practitioner_portal'),
      description: t('practitioner_portal_desc'),
      icon: Stethoscope,
      iconBg: "bg-cyan-500/20",
      iconColor: "text-cyan-500",
      path: "/practitioner-portal",
    },
  ];

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div className="flex items-center gap-4 mb-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/dashboard")}
          className="hover:bg-primary/10"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{t('professional_hub')}</h1>
          <p className="text-muted-foreground mt-1">{t('professional_hub_desc')}</p>
        </div>
      </div>

      <SubscriptionGate feature="professional_portals">
        <div className="grid gap-4">
          {portalItems.map((item) => (
            <Card
              key={item.path}
              className="p-6 hover:shadow-xl hover:border-primary/20 transition-all duration-300 cursor-pointer group"
              onClick={() => navigate(item.path)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-3 ${item.iconBg} rounded-xl transition-all duration-300 group-hover:scale-110`}>
                    <item.icon className={`w-6 h-6 ${item.iconColor}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                    <Badge 
                      variant="secondary" 
                      className="mt-2 inline-flex items-center gap-1 capitalize"
                    >
                      <Crown className="w-3 h-3" />
                      Pro
                    </Badge>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
            </Card>
          ))}
        </div>
      </SubscriptionGate>
    </div>
  );
};

export default ProfessionalHub;

import { ArrowLeft, MessageSquare, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Connect = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(['social', 'common']);

  const sections = [
    {
      key: "community-feed",
      icon: MessageSquare,
      title: t('social:community_feed'),
      description: t('social:share_fitness_journey'),
      path: "/feed",
      color: "text-primary",
    },
    {
      key: "socials",
      icon: Users,
      title: t('social:socials'),
      description: t('social:connect_with_friends_creators'),
      path: "/socials",
      color: "text-accent",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{t('common:nav.connect')}</h1>
            <p className="text-muted-foreground text-sm">{t('social:connect_fitness_enthusiasts')}</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {sections.map(({ key, icon: Icon, title, description, path, color }) => (
            <Card
              key={key}
              className="p-6 cursor-pointer hover:bg-accent/5 transition-colors"
              onClick={() => navigate(path)}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl bg-primary/10 ${color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{title}</h3>
                  <p className="text-muted-foreground text-sm mt-1">{description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Connect;

import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HelpCircle, ArrowLeft, Mail, MessageCircle, Book } from "lucide-react";

const Support = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('settings');

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/settings")}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold mb-2">{t('support_title')}</h1>
          <p className="text-muted-foreground">{t('support_subtitle')}</p>
        </div>
      </div>

      <div className="grid gap-4">
        <Card className="p-6 hover:bg-accent/50 transition-colors cursor-pointer">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Book className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">{t('help_center')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('help_center_desc')}
              </p>
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
              <p className="text-sm text-muted-foreground">
                {t('live_chat_desc')}
              </p>
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
              <p className="text-sm text-muted-foreground">
                {t('email_support_desc')}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Support;

import { useTranslation } from "react-i18next";
import { PatientsPanel } from "./components/PatientsPanel";
import { VideoSessionsPanel } from "./components/VideoSessionsPanel";
import { Shield, Lock, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

function SecurityBadges() {
  const { t } = useTranslation(["clinician"]);
  
  return (
    <div className="flex flex-wrap gap-2">
      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 border border-primary/20 px-2 py-0.5 text-[10px] text-primary">
        <Lock className="h-3 w-3" />
        {t("pq_encryption")}
      </span>
      <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 text-[10px] text-cyan-500">
        <Shield className="h-3 w-3" />
        {t("cmix_protection")}
      </span>
    </div>
  );
}

function SecureMessagingCard() {
  const { t } = useTranslation(["clinician"]);
  const navigate = useNavigate();

  return (
    <div className="rounded-xl border bg-background p-3 space-y-3">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-4 w-4 text-muted-foreground" />
        <p className="text-xs font-semibold uppercase text-muted-foreground">
          {t("secure_messaging")}
        </p>
      </div>
      <p className="text-xs text-muted-foreground">
        {t("secure_messaging_desc")}
      </p>
      <Button 
        size="sm" 
        variant="outline" 
        className="w-full text-xs"
        onClick={() => navigate("/messages")}
      >
        <Lock className="h-3 w-3 mr-1" />
        {t("open_messages")}
      </Button>
    </div>
  );
}

export function ClinicianDashboardScreen() {
  const { t } = useTranslation(["clinician"]);

  return (
    <div className="p-4 space-y-4 max-w-6xl mx-auto">
      <header className="space-y-2">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">{t("clinician_dashboard")}</h1>
          <SecurityBadges />
        </div>
        <p className="text-xs text-muted-foreground max-w-2xl">
          {t("dashboard_description")}
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <PatientsPanel />
        </div>
        <div className="space-y-4">
          <VideoSessionsPanel />
          <SecureMessagingCard />
        </div>
      </div>
    </div>
  );
}

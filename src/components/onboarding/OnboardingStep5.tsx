import { Activity } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function OnboardingStep5() {
  const requestNotifications = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        toast.success("Notifications enabled!");
      }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-6">
        <Activity className="w-12 h-12 mx-auto mb-4 text-primary" />
        <h2 className="text-2xl font-bold mb-2">Stay on track</h2>
        <p className="text-muted-foreground">
          We'll send you helpful reminders to keep you motivated
        </p>
      </div>

      <div className="space-y-4">
        <Card className="p-4 bg-muted/50">
          <h3 className="font-semibold mb-2">📱 Enable Notifications</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Get gentle reminders for meals, workouts, and weigh-ins to stay consistent
          </p>
          <Button variant="outline" size="sm" onClick={requestNotifications}>
            Allow Notifications
          </Button>
        </Card>

        <div className="text-sm text-muted-foreground">
          You can customize your reminder preferences anytime in Settings
        </div>
      </div>
    </div>
  );
}

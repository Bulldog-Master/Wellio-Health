import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Bell, CreditCard, HelpCircle, ArrowLeft, ChevronRight, Heart, Crown } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { Badge } from "@/components/ui/badge";

const SettingsMenu = () => {
  const navigate = useNavigate();
  const { tier } = useSubscription();

  const settingsItems = [
    {
      title: "Subscription",
      description: `Current plan: ${tier.toUpperCase()} - Manage your subscription`,
      icon: Crown,
      iconBg: "bg-primary/20",
      iconColor: "text-primary",
      path: "/subscription",
      badge: tier !== 'free' ? tier : undefined,
    },
    {
      title: "Privacy & Security",
      description: "Control your privacy settings and security options",
      icon: Shield,
      iconBg: "bg-destructive/20",
      iconColor: "text-destructive",
      path: "/settings/privacy-security",
    },
    {
      title: "Close Friends",
      description: "Manage who can see your close friends stories",
      icon: Heart,
      iconBg: "bg-pink-500/20",
      iconColor: "text-pink-500",
      path: "/settings/close-friends",
    },
    {
      title: "Trusted Devices",
      description: "Manage devices that can skip 2FA verification",
      icon: Shield,
      iconBg: "bg-primary/20",
      iconColor: "text-primary",
      path: "/settings/trusted-devices",
    },
    {
      title: "Orders & Payments",
      description: "View your orders and manage payment methods",
      icon: CreditCard,
      iconBg: "bg-warning/20",
      iconColor: "text-warning",
      path: "/settings/orders-payments",
    },
    {
      title: "Notifications",
      description: "Configure your notification preferences",
      icon: Bell,
      iconBg: "bg-secondary/20",
      iconColor: "text-secondary",
      path: "/settings/notifications",
    },
    {
      title: "Support",
      description: "Get help and contact support",
      icon: HelpCircle,
      iconBg: "bg-primary/20",
      iconColor: "text-primary",
      path: "/settings/support",
    },
  ];

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/profile")}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">Account preferences and configuration</p>
        </div>
      </div>

      <div className="grid gap-4">
        {settingsItems.map((item) => (
          <Card
            key={item.path}
            className="p-4 hover:bg-accent/50 transition-colors cursor-pointer"
            onClick={() => navigate(item.path)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-2 ${item.iconBg} rounded-lg`}>
                  <item.icon className={`w-5 h-5 ${item.iconColor}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{item.title}</h3>
                    {item.badge && (
                      <Badge variant="secondary" className="text-xs uppercase">
                        {item.badge}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SettingsMenu;

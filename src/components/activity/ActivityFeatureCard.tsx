import { Card } from "@/components/ui/card";
import { Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { LucideIcon } from "lucide-react";

interface ActivityFeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  iconColor: string;
  iconBgColor: string;
  path: string;
  isVip?: boolean;
}

export const ActivityFeatureCard = ({
  title,
  description,
  icon: Icon,
  iconColor,
  iconBgColor,
  path,
  isVip = false
}: ActivityFeatureCardProps) => {
  const navigate = useNavigate();

  return (
    <Card 
      className="p-6 bg-gradient-card shadow-md hover:shadow-lg transition-all cursor-pointer relative overflow-hidden"
      onClick={() => navigate(path)}
    >
      {isVip && (
        <div className="absolute top-2 right-2 flex items-center gap-1 bg-primary/20 px-2 py-0.5 rounded-full">
          <Crown className="w-3 h-3 text-primary" />
          <span className="text-xs font-semibold text-primary">VIP</span>
        </div>
      )}
      <div className="flex items-start gap-4">
        <div className={`p-3 ${iconBgColor} rounded-xl`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </Card>
  );
};

export default ActivityFeatureCard;

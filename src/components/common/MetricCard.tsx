import { LucideIcon } from "lucide-react";
import { Card } from "../ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
  variant?: "default" | "primary" | "accent";
}

const MetricCard = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend = "neutral",
  variant = "default" 
}: MetricCardProps) => {
  const trendColors = {
    up: "text-success",
    down: "text-destructive",
    neutral: "text-muted-foreground"
  };

  const variantStyles = {
    default: "bg-gradient-card",
    primary: "bg-gradient-primary text-primary-foreground",
    accent: "bg-gradient-accent text-accent-foreground"
  };

  return (
    <Card className={cn(
      "p-6 shadow-sm hover:shadow-md transition-smooth border",
      variantStyles[variant]
    )}>
      <div className="flex items-start justify-between mb-4">
        <div className={cn(
          "p-3 rounded-lg",
          variant === "default" ? "bg-primary/10" : "bg-white/20"
        )}>
          <Icon className={cn(
            "w-5 h-5",
            variant === "default" ? "text-primary" : "text-current"
          )} />
        </div>
        {subtitle && (
          <span className={cn(
            "text-sm font-medium",
            variant === "default" ? trendColors[trend] : "text-current opacity-80"
          )}>
            {subtitle}
          </span>
        )}
      </div>
      <div>
        <p className={cn(
          "text-sm font-medium mb-1",
          variant === "default" ? "text-muted-foreground" : "text-current opacity-80"
        )}>
          {title}
        </p>
        <p className="text-3xl font-bold">{value}</p>
      </div>
    </Card>
  );
};

export default MetricCard;
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Utensils, BookOpen, Calendar, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Food = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(['food', 'common']);

  const menuItems = [
    {
      title: t('food:food_log'),
      description: t('food:track_daily_nutrition'),
      icon: Utensils,
      path: "/food/log",
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: t('food:recipes'),
      description: t('food:browse_save_recipes'),
      icon: BookOpen,
      path: "/food/recipes",
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      title: t('food:meal_planner'),
      description: t('food:plan_weekly_meals'),
      icon: Calendar,
      path: "/meal-planner",
      color: "text-secondary",
      bgColor: "bg-secondary/10",
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4 mb-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/")}
          className="hover:bg-primary/10"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-xl">
            <Utensils className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{t('food:food')}</h1>
            <p className="text-muted-foreground mt-1">{t('food:manage_nutrition_recipes')}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {menuItems.map((item) => (
          <Card
            key={item.path}
            className="p-6 cursor-pointer hover:shadow-xl hover:border-primary/20 transition-all duration-300 group"
            onClick={() => navigate(item.path)}
          >
            <div className="flex flex-col items-center text-center gap-4">
              <div className={`p-4 ${item.bgColor} rounded-2xl transition-all duration-300 group-hover:scale-110`}>
                <item.icon className={`w-8 h-8 ${item.color}`} />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Food;

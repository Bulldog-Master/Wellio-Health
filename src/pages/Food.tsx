import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Utensils, BookOpen, Calendar, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Food = () => {
  const navigate = useNavigate();

  const menuItems = [
    {
      title: "Food Log",
      description: "Track your daily nutrition with AI",
      icon: Utensils,
      path: "/food/log",
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Recipes",
      description: "Browse and save your favorite recipes",
      icon: BookOpen,
      path: "/food/recipes",
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      title: "Meal Planner",
      description: "Plan your weekly meals in advance",
      icon: Calendar,
      path: "/meal-planner",
      color: "text-secondary",
      bgColor: "bg-secondary/10",
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate("/")}
        className="gap-2 mb-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Button>
      <div className="flex items-center gap-3">
        <div className="p-3 bg-primary/10 rounded-xl">
          <Utensils className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Food</h1>
          <p className="text-muted-foreground">Manage your nutrition and recipes</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {menuItems.map((item) => (
          <Card
            key={item.path}
            className="p-6 cursor-pointer transition-all hover:shadow-lg hover:scale-105 bg-gradient-card"
            onClick={() => navigate(item.path)}
          >
            <div className="flex items-start gap-4">
              <div className={`p-3 ${item.bgColor} rounded-xl`}>
                <item.icon className={`w-6 h-6 ${item.color}`} />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Food;

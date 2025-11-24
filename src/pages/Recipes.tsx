import { Card } from "@/components/ui/card";
import { BookOpen, ChevronDown, ArrowLeft } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Recipes = () => {
  const navigate = useNavigate();
  
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/food')}
          className="shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="p-3 bg-primary/10 rounded-xl">
          <BookOpen className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Recipes</h1>
          <p className="text-muted-foreground">Browse recipes by category</p>
        </div>
      </div>

      <Card className="p-6 bg-gradient-card shadow-md">
        <h3 className="text-lg font-semibold mb-6">Recipe Categories</h3>

        <div className="space-y-3">
          {/* Vegan Category */}
          <Collapsible>
            <CollapsibleTrigger className="w-full">
              <div className="flex items-center justify-between p-4 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors">
                <span className="font-medium">🌱 Vegan</span>
                <ChevronDown className="w-4 h-4" />
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 ml-4 space-y-2">
              <div className="p-3 bg-accent/10 rounded-lg text-sm">🥖 Bread</div>
              <div className="p-3 bg-accent/10 rounded-lg text-sm">🥬 Vegetables</div>
              <div className="p-3 bg-accent/10 rounded-lg text-sm">🍎 Fruits</div>
            </CollapsibleContent>
          </Collapsible>

          {/* Keto Category */}
          <Collapsible>
            <CollapsibleTrigger className="w-full">
              <div className="flex items-center justify-between p-4 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors">
                <span className="font-medium">🥑 Keto</span>
                <ChevronDown className="w-4 h-4" />
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 ml-4 space-y-2">
              <div className="p-3 bg-accent/10 rounded-lg text-sm">🥩 Meats (Beef, Chicken, Pork)</div>
              <div className="p-3 bg-accent/10 rounded-lg text-sm">🧀 Dairy</div>
              <div className="p-3 bg-accent/10 rounded-lg text-sm">🥬 Low-Carb Vegetables</div>
            </CollapsibleContent>
          </Collapsible>

          {/* High Protein Category */}
          <Collapsible>
            <CollapsibleTrigger className="w-full">
              <div className="flex items-center justify-between p-4 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors">
                <span className="font-medium">💪 High Protein</span>
                <ChevronDown className="w-4 h-4" />
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 ml-4 space-y-2">
              <div className="p-3 bg-accent/10 rounded-lg text-sm">🍗 Chicken</div>
              <div className="p-3 bg-accent/10 rounded-lg text-sm">🥩 Beef</div>
              <div className="p-3 bg-accent/10 rounded-lg text-sm">🐟 Fish & Seafood</div>
              <div className="p-3 bg-accent/10 rounded-lg text-sm">🥚 Eggs</div>
            </CollapsibleContent>
          </Collapsible>

          {/* Mediterranean Category */}
          <Collapsible>
            <CollapsibleTrigger className="w-full">
              <div className="flex items-center justify-between p-4 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors">
                <span className="font-medium">🫒 Mediterranean</span>
                <ChevronDown className="w-4 h-4" />
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 ml-4 space-y-2">
              <div className="p-3 bg-accent/10 rounded-lg text-sm">🐟 Fish & Seafood</div>
              <div className="p-3 bg-accent/10 rounded-lg text-sm">🥬 Vegetables</div>
              <div className="p-3 bg-accent/10 rounded-lg text-sm">🫒 Olive Oil & Nuts</div>
              <div className="p-3 bg-accent/10 rounded-lg text-sm">🥖 Whole Grains</div>
            </CollapsibleContent>
          </Collapsible>

          {/* Custom Category */}
          <Collapsible>
            <CollapsibleTrigger className="w-full">
              <div className="flex items-center justify-between p-4 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors">
                <span className="font-medium">⭐ Custom</span>
                <ChevronDown className="w-4 h-4" />
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 ml-4 space-y-2">
              <div className="p-3 bg-accent/10 rounded-lg text-sm">🥖 Bread</div>
              <div className="p-3 bg-accent/10 rounded-lg text-sm">🥬 Vegetables</div>
              <div className="p-3 bg-accent/10 rounded-lg text-sm">🥩 Meats</div>
              <div className="p-3 bg-accent/10 rounded-lg text-sm">🍎 Fruits</div>
              <div className="p-3 bg-accent/10 rounded-lg text-sm">🧀 Dairy</div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </Card>
    </div>
  );
};

export default Recipes;

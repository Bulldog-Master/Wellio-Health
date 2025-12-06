import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, ArrowLeft, RefreshCw, Lightbulb, Check, ChevronDown, ChevronUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfWeek } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import SEOHead from "@/components/SEOHead";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface GroceryItem {
  name: string;
  quantity: string;
  unit: string;
  checked?: boolean;
}

interface GroceryCategory {
  name: string;
  items: GroceryItem[];
  isOpen?: boolean;
}

const GroceryList = () => {
  const { t } = useTranslation(['food', 'common']);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [categories, setCategories] = useState<GroceryCategory[]>([]);
  const [tips, setTips] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mealCount, setMealCount] = useState(0);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  const weekStartDate = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');

  useEffect(() => {
    // Load checked items from localStorage
    const saved = localStorage.getItem(`grocery-checked-${weekStartDate}`);
    if (saved) {
      setCheckedItems(new Set(JSON.parse(saved)));
    }
  }, [weekStartDate]);

  const generateGroceryList = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: t('common:error'),
          description: t('please_login'),
          variant: "destructive",
        });
        return;
      }

      const response = await supabase.functions.invoke('generate-grocery-list', {
        body: { weekStartDate },
      });

      if (response.error) throw response.error;

      const data = response.data;
      if (data.success) {
        setCategories(data.groceryList.categories?.map((c: GroceryCategory) => ({ ...c, isOpen: true })) || []);
        setTips(data.groceryList.tips || []);
        setMealCount(data.mealCount || 0);
        
        if (data.mealCount === 0) {
          toast({
            title: t('no_meal_plans'),
            description: t('add_meals_first'),
          });
        } else {
          toast({
            title: t('common:success'),
            description: t('grocery_list_generated'),
          });
        }
      }
    } catch (error) {
      console.error('Error generating grocery list:', error);
      toast({
        title: t('common:error'),
        description: t('failed_generate_list'),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleItem = (itemName: string) => {
    const newChecked = new Set(checkedItems);
    if (newChecked.has(itemName)) {
      newChecked.delete(itemName);
    } else {
      newChecked.add(itemName);
    }
    setCheckedItems(newChecked);
    localStorage.setItem(`grocery-checked-${weekStartDate}`, JSON.stringify([...newChecked]));
  };

  const toggleCategory = (index: number) => {
    setCategories(prev => prev.map((cat, i) => 
      i === index ? { ...cat, isOpen: !cat.isOpen } : cat
    ));
  };

  const totalItems = categories.reduce((sum, cat) => sum + cat.items.length, 0);
  const checkedCount = checkedItems.size;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/food')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-green-500/10 rounded-xl">
            <ShoppingCart className="w-6 h-6 text-green-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{t('grocery_list')}</h1>
            <p className="text-muted-foreground">{t('smart_grocery_list')}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {totalItems > 0 && (
            <Badge variant="secondary">
              {checkedCount}/{totalItems} {t('common:items')}
            </Badge>
          )}
        </div>
        <Button onClick={generateGroceryList} disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? t('generating') : t('generate_list')}
        </Button>
      </div>

      {categories.length === 0 ? (
        <Card className="p-8 text-center">
          <ShoppingCart className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">{t('no_grocery_list')}</h3>
          <p className="text-muted-foreground mb-4">{t('generate_from_meals')}</p>
          <Button onClick={generateGroceryList} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            {t('generate_list')}
          </Button>
        </Card>
      ) : (
        <>
          {mealCount > 0 && (
            <Card className="p-4 bg-primary/5 border-primary/20">
              <p className="text-sm text-muted-foreground">
                {t('generated_for_meals', { count: mealCount })}
              </p>
            </Card>
          )}

          <div className="space-y-4">
            {categories.map((category, catIndex) => (
              <Collapsible key={category.name} open={category.isOpen}>
                <Card className="overflow-hidden">
                  <CollapsibleTrigger asChild>
                    <button 
                      className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
                      onClick={() => toggleCategory(catIndex)}
                    >
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{category.name}</h3>
                        <Badge variant="outline">{category.items.length}</Badge>
                      </div>
                      {category.isOpen ? (
                        <ChevronUp className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                      )}
                    </button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="border-t divide-y">
                      {category.items.map((item, itemIndex) => (
                        <div 
                          key={`${item.name}-${itemIndex}`}
                          className="p-3 flex items-center gap-3 hover:bg-muted/30 transition-colors"
                        >
                          <Checkbox 
                            checked={checkedItems.has(item.name)}
                            onCheckedChange={() => toggleItem(item.name)}
                          />
                          <span className={checkedItems.has(item.name) ? 'line-through text-muted-foreground' : ''}>
                            {item.name}
                          </span>
                          <span className="text-sm text-muted-foreground ml-auto">
                            {item.quantity} {item.unit}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            ))}
          </div>

          {tips.length > 0 && (
            <Card className="p-4 bg-yellow-500/5 border-yellow-500/20">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-yellow-500 mt-0.5" />
                <div>
                  <h4 className="font-semibold mb-2">{t('shopping_tips')}</h4>
                  <ul className="space-y-1">
                    {tips.map((tip, index) => (
                      <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default GroceryList;

import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Calendar, ChevronDown, ChevronUp, ExternalLink, Pencil, Plus, Trash2 } from 'lucide-react';
import { NewsCategory, NewsItem } from './types';

interface NewsCategoryCardProps {
  category: NewsCategory;
  items: NewsItem[];
  isOpen: boolean;
  isSpanish: boolean;
  isAdmin: boolean;
  categoryBadgeType: string;
  onToggle: () => void;
  onNewsClick: (url: string) => void;
  onEdit: (item: NewsItem) => void;
  onDelete: (id: string) => void;
  onAddToCategory: () => void;
}

export const NewsCategoryCard = ({
  category,
  items,
  isOpen,
  isSpanish,
  isAdmin,
  categoryBadgeType,
  onToggle,
  onNewsClick,
  onEdit,
  onDelete,
  onAddToCategory
}: NewsCategoryCardProps) => {
  const { t } = useTranslation(['common', 'news']);
  const Icon = category.icon;

  const getBadgeVariant = (type: string) => {
    switch (type) {
      case 'live': return 'destructive';
      case 'upcoming': return 'default';
      default: return 'secondary';
    }
  };

  const getBadgeText = (type: string) => {
    switch (type) {
      case 'live': return t('news:live');
      case 'upcoming': return t('news:upcoming');
      default: return t('news:recent');
    }
  };

  return (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <Card className="hover:shadow-lg transition-all duration-300 border-border/50">
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer pb-2">
            <div className="flex items-start justify-between">
              <div className={`w-12 h-12 rounded-xl ${category.bgColor} flex items-center justify-center hover:scale-110 transition-transform`}>
                <Icon className={`h-6 w-6 ${category.color}`} />
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={getBadgeVariant(categoryBadgeType)} className="text-xs">
                  {getBadgeText(categoryBadgeType)}
                </Badge>
                {isOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
              </div>
            </div>
            <CardTitle className="text-lg mt-3">{t(category.titleKey)}</CardTitle>
            <CardDescription className="line-clamp-2">{t(category.descKey)}</CardDescription>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="space-y-2 pt-0">
            <div className="space-y-2 border-t pt-3">
              {items.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-2">
                  {t('common:no_data')}
                </p>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="flex items-start gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors group">
                    <button onClick={() => onNewsClick(item.url)} className="flex-1 flex items-start gap-2 text-left">
                      <Calendar className={`h-4 w-4 mt-0.5 ${category.color} flex-shrink-0`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium group-hover:text-primary transition-colors">
                          {isSpanish && item.title_es ? item.title_es : item.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {isSpanish && item.event_date_es ? item.event_date_es : item.event_date}
                        </p>
                      </div>
                      <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1" />
                    </button>
                    
                    {isAdmin && (
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onEdit(item)}>
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => onDelete(item.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
            
            {isAdmin && (
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full mt-2"
                onClick={onAddToCategory}
              >
                <Plus className="h-3 w-3 mr-1" />
                Add to {t(category.titleKey)}
              </Button>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};

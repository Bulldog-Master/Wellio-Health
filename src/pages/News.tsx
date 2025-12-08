import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Newspaper, Globe, Timer, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAdminStatus } from '@/hooks/useAdminStatus';
import SEOHead from '@/components/SEOHead';
import AdBanner from '@/components/AdBanner';
import { useNews } from '@/hooks/news';
import { newsCategories, NewsCategoryCard, NewsFormDialog } from '@/components/news';

const News = () => {
  const { t } = useTranslation(['common', 'news']);
  const navigate = useNavigate();
  const { isAdmin } = useAdminStatus();

  const {
    isSpanish,
    openCategories,
    isAddDialogOpen,
    setIsAddDialogOpen,
    editingItem,
    setEditingItem,
    formData,
    setFormData,
    updateMutation,
    deleteMutation,
    handleAddSubmit,
    toggleCategory,
    getItemsByCategory,
    getCategoryBadgeType,
    handleNewsClick
  } = useNews();

  const handleEditSubmit = () => {
    if (editingItem) {
      updateMutation.mutate({
        ...editingItem,
        ...formData,
        title_es: formData.title_es || null,
        event_date: formData.event_date || null,
        event_date_es: formData.event_date_es || null
      });
    }
  };

  return (
    <>
      <SEOHead titleKey="page_title" descriptionKey="page_description" namespace="news" />
      <div className="min-h-screen bg-background p-4 md:p-6 pb-24 md:pb-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/')} aria-label={t('common:back')}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">{t('news:title')}</h1>
                <p className="text-muted-foreground">{t('news:subtitle')}</p>
              </div>
            </div>
            
            {isAdmin && (
              <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                {t('common:add')}
              </Button>
            )}
          </div>

          <AdBanner placement="news" variant="minimal" />

          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="gap-1">
              <Globe className="h-3 w-3" />
              {t('news:global_coverage')}
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Timer className="h-3 w-3" />
              {t('news:updated_daily')}
            </Badge>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {newsCategories.map((category) => (
              <NewsCategoryCard
                key={category.id}
                category={category}
                items={getItemsByCategory(category.id)}
                isOpen={openCategories.includes(category.id)}
                isSpanish={isSpanish}
                isAdmin={isAdmin}
                categoryBadgeType={getCategoryBadgeType(category.id)}
                onToggle={() => toggleCategory(category.id)}
                onNewsClick={handleNewsClick}
                onEdit={(item) => {
                  setEditingItem(item);
                  setFormData({
                    title: item.title,
                    title_es: item.title_es || '',
                    url: item.url,
                    event_date: item.event_date || '',
                    event_date_es: item.event_date_es || '',
                    badge_type: item.badge_type || 'upcoming',
                    category: item.category
                  });
                }}
                onDelete={(id) => deleteMutation.mutate(id)}
                onAddToCategory={() => {
                  setFormData(prev => ({ ...prev, category: category.id }));
                  setIsAddDialogOpen(true);
                }}
              />
            ))}
          </div>

          {/* Coming Soon Notice */}
          <Card className="bg-muted/50 border-dashed">
            <CardContent className="py-8 text-center">
              <Newspaper className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">{t('news:coming_soon_title')}</h3>
              <p className="text-muted-foreground max-w-md mx-auto">{t('news:coming_soon_desc')}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add News Dialog */}
      <NewsFormDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        formData={formData}
        setFormData={setFormData}
        categories={newsCategories}
        onSubmit={handleAddSubmit}
      />

      {/* Edit News Dialog */}
      <NewsFormDialog
        open={!!editingItem}
        onOpenChange={(open) => !open && setEditingItem(null)}
        formData={formData}
        setFormData={setFormData}
        categories={newsCategories}
        onSubmit={handleEditSubmit}
        isEdit
      />
    </>
  );
};

export default News;

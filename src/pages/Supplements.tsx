import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Pill, ListChecks, TrendingUp, ArrowLeft, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSupplements } from "@/hooks/supplements";
import { SupplementCard, SupplementFormDialog, popularSupplements } from "@/components/supplements";

const Supplements = () => {
  const { t } = useTranslation('fitness');
  const navigate = useNavigate();

  const {
    supplements,
    isLoading,
    selectedSupplement,
    isDialogOpen,
    setIsDialogOpen,
    isSaving,
    formData,
    setFormData,
    handlePopularClick,
    handleCustomAdd,
    handleSave,
    handleDelete,
  } = useSupplements();

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-xl">
            <Pill className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{t('supplements_title')}</h1>
            <p className="text-muted-foreground">{t('track_discover_supplements')}</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          onClick={() => navigate('/activity')}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('back_to_activity')}
        </Button>
      </div>

      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="personal" className="gap-2">
            <ListChecks className="w-4 h-4" />
            {t('personal_list')}
          </TabsTrigger>
          <TabsTrigger value="popular" className="gap-2">
            <TrendingUp className="w-4 h-4" />
            {t('popular')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-4 mt-6">
          <Card className="p-6 bg-gradient-card shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{t('my_supplements')}</h3>
              <Button size="sm" className="gap-2" onClick={handleCustomAdd}>
                <Plus className="w-4 h-4" />
                {t('add_supplement')}
              </Button>
            </div>
            {isLoading ? (
              <div className="text-center text-muted-foreground py-8">{t('loading')}</div>
            ) : supplements.length > 0 ? (
              <div className="space-y-3">
                {supplements.map((supplement) => (
                  <SupplementCard 
                    key={supplement.id} 
                    supplement={supplement} 
                    onDelete={handleDelete} 
                  />
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <p>{t('no_supplements_yet')}</p>
                <p className="text-sm mt-2">{t('start_adding_supplements')}</p>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="popular" className="space-y-4 mt-6">
          <Card className="p-6 bg-gradient-card shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{t('popular_supplements')}</h3>
              <Button size="sm" className="gap-2" onClick={handleCustomAdd}>
                <Plus className="w-4 h-4" />
                {t('add_custom')}
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {popularSupplements.map((supplement, index) => (
                <div 
                  key={index} 
                  className="p-4 bg-secondary rounded-lg hover:bg-secondary/80 transition-all cursor-pointer"
                  onClick={() => handlePopularClick(supplement)}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Pill className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{supplement.name}</h4>
                      <p className="text-sm text-muted-foreground">{supplement.description}</p>
                      <span className="text-xs text-primary font-medium mt-1 inline-block">
                        {supplement.category}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <SupplementFormDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        formData={formData}
        setFormData={setFormData}
        onSave={handleSave}
        isSaving={isSaving}
        selectedSupplement={selectedSupplement}
      />
    </div>
  );
};

export default Supplements;

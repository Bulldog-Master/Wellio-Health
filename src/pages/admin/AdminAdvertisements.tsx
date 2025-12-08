import { useTranslation } from 'react-i18next';
import { useAdminStatus } from '@/hooks/auth';
import { useAdvertisements } from '@/hooks/admin';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { SEOHead } from '@/components/common';
import { AdFormDialog, AdCard } from '@/components/admin/advertisements';
import { Megaphone, Plus, ArrowLeft } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';

const AdminAdvertisements = () => {
  const { t } = useTranslation(['ads', 'common']);
  const { isAdmin, isLoading: adminLoading } = useAdminStatus();
  
  const {
    ads,
    isLoading,
    isDialogOpen,
    setIsDialogOpen,
    editingAd,
    formData,
    setFormData,
    resetForm,
    handleSubmit,
    handleEdit,
    handleDelete,
  } = useAdvertisements(isAdmin);

  if (adminLoading) {
    return <div className="p-6"><Skeleton className="h-96" /></div>;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <SEOHead titleKey="admin.manage_ads" namespace="ads" />
      
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/admin/vip">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Megaphone className="h-8 w-8 text-primary" />
                {t('ads:admin.manage_ads')}
              </h1>
            </div>
          </div>
          
          <AdFormDialog
            isOpen={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            editingAd={editingAd}
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleSubmit}
            onReset={resetForm}
          />
        </div>

        {isLoading ? (
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        ) : ads && ads.length > 0 ? (
          <div className="grid gap-4">
            {ads.map((ad) => (
              <AdCard
                key={ad.id}
                ad={ad}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <Megaphone className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">{t('common:no_data')}</h3>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                {t('ads:admin.add_ad')}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminAdvertisements;

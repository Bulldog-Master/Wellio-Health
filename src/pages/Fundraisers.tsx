import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DonationModal } from '@/components/DonationModal';
import { Heart, Search, ArrowLeft } from 'lucide-react';
import { useFundraisers } from '@/hooks/fundraisers';
import { FundraiserFormDialog, FundraiserCard } from '@/components/fundraisers';

export default function Fundraisers() {
  const { t } = useTranslation('fundraisers');
  const navigate = useNavigate();
  const [donationModalOpen, setDonationModalOpen] = useState(false);
  const [selectedFundraiserId, setSelectedFundraiserId] = useState<string>('');
  const [selectedFundraiserTitle, setSelectedFundraiserTitle] = useState<string>('');

  const {
    filteredFundraisers,
    isLoading,
    isDialogOpen,
    setIsDialogOpen,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    formData,
    setFormData,
    categories,
    handleSubmit,
    getCategoryLabel,
  } = useFundraisers();

  const handleDonate = (fundraiserId: string, fundraiserTitle: string) => {
    setSelectedFundraiserId(fundraiserId);
    setSelectedFundraiserTitle(fundraiserTitle);
    setDonationModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="flex flex-col gap-6 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="w-fit"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold mb-2">{t('title')}</h1>
              <p className="text-muted-foreground">{t('subtitle')}</p>
            </div>

            <FundraiserFormDialog
              isOpen={isDialogOpen}
              onOpenChange={setIsDialogOpen}
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleSubmit}
              categories={categories}
            />
          </div>

          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('search_placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder={t('all_categories')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('all_categories')}</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden animate-pulse">
                <div className="h-48 bg-muted" />
                <div className="p-6 space-y-3">
                  <div className="h-6 bg-muted rounded" />
                  <div className="h-4 bg-muted rounded" />
                  <div className="h-4 bg-muted rounded w-3/4" />
                </div>
              </Card>
            ))}
          </div>
        ) : filteredFundraisers.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              {searchQuery || selectedCategory !== 'all' ? t('no_fundraisers_found') : t('no_fundraisers_yet')}
            </h3>
            <p className="text-muted-foreground">
              {searchQuery || selectedCategory !== 'all' ? t('try_adjusting_filters') : t('be_first_to_create')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFundraisers.map((fundraiser) => (
              <FundraiserCard
                key={fundraiser.id}
                fundraiser={fundraiser}
                getCategoryLabel={getCategoryLabel}
                onDonate={handleDonate}
              />
            ))}
          </div>
        )}
      </div>

      <DonationModal
        open={donationModalOpen}
        onOpenChange={setDonationModalOpen}
        fundraiserId={selectedFundraiserId}
        fundraiserTitle={selectedFundraiserTitle}
        onSuccess={() => setDonationModalOpen(false)}
      />
    </div>
  );
}

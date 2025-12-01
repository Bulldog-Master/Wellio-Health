import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DonationModal } from '@/components/DonationModal';
import { Heart, Plus, Calendar, MapPin, BadgeCheck, Search, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fundraiserSchema, validateAndSanitize } from '@/lib/validationSchemas';
import { useTranslation } from 'react-i18next';

interface Fundraiser {
  id: string;
  title: string;
  description: string;
  goal_amount: number;
  current_amount: number;
  category: string;
  location: string;
  image_url: string;
  verified: boolean;
  end_date: string;
  user_id: string;
  status: string;
  profiles: {
    full_name: string;
    avatar_url: string;
  };
}

export default function Fundraisers() {
  const { t } = useTranslation('fundraisers');
  const navigate = useNavigate();
  const [fundraisers, setFundraisers] = useState<Fundraiser[]>([]);
  const [filteredFundraisers, setFilteredFundraisers] = useState<Fundraiser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [donationModalOpen, setDonationModalOpen] = useState(false);
  const [selectedFundraiserId, setSelectedFundraiserId] = useState<string>('');
  const [selectedFundraiserTitle, setSelectedFundraiserTitle] = useState<string>('');

  const categories = [
    { value: 'Medical', label: t('categories.medical') },
    { value: 'Community Event', label: t('categories.community_event') },
    { value: 'Charity', label: t('categories.charity') },
    { value: 'Equipment', label: t('categories.equipment') },
    { value: 'Other', label: t('categories.other') },
  ];

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    goal_amount: '',
    category: '',
    location: '',
    end_date: '',
    image: null as File | null
  });

  useEffect(() => {
    fetchFundraisers();
  }, []);

  useEffect(() => {
    filterFundraisers();
  }, [fundraisers, searchQuery, selectedCategory]);

  const filterFundraisers = () => {
    let filtered = [...fundraisers];

    if (searchQuery) {
      filtered = filtered.filter(f =>
        f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.location?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(f => f.category === selectedCategory);
    }

    setFilteredFundraisers(filtered);
  };

  const fetchFundraisers = async () => {
    try {
      const { data, error } = await supabase
        .from('fundraisers')
        .select(`
          *,
          profiles (full_name, avatar_url)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFundraisers((data as any) || []);
    } catch (error) {
      console.error('Error fetching fundraisers:', error);
      toast.error(t('messages.failed_to_load'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error(t('messages.sign_in_required'));
      return;
    }

    try {
      // Validate fundraiser data
      const validation = validateAndSanitize(fundraiserSchema, {
        title: formData.title,
        description: formData.description,
        goal_amount: parseFloat(formData.goal_amount),
        category: formData.category,
        location: formData.location || undefined,
        end_date: formData.end_date,
      });

      if (validation.success === false) {
        toast.error(validation.error);
        return;
      }

      let imageUrl = null;

      if (formData.image) {
        const fileExt = formData.image.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('fundraiser-images')
          .upload(fileName, formData.image);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('fundraiser-images')
          .getPublicUrl(fileName);

        imageUrl = publicUrl;
      }

      const { error } = await supabase
        .from('fundraisers')
        .insert({
          user_id: user.id,
          ...validation.data,
          image_url: imageUrl
        });

      if (error) throw error;

      toast.success(t('messages.created_successfully'));
      setIsDialogOpen(false);
      setFormData({
        title: '',
        description: '',
        goal_amount: '',
        category: '',
        location: '',
        end_date: '',
        image: null
      });
      fetchFundraisers();
    } catch (error) {
      console.error('Error creating fundraiser:', error);
      toast.error(t('messages.failed_to_create'));
    }
  };

  const handleDonate = (fundraiserId: string, fundraiserTitle: string) => {
    setSelectedFundraiserId(fundraiserId);
    setSelectedFundraiserTitle(fundraiserTitle);
    setDonationModalOpen(true);
  };

  const getCategoryLabel = (categoryValue: string) => {
    const category = categories.find(c => c.value === categoryValue);
    return category ? category.label : categoryValue;
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

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  {t('create_fundraiser')}
                </Button>
              </DialogTrigger>

              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{t('create_new_fundraiser')}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="image">{t('form.cover_image')}</Label>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('image')?.click()}
                        className="shrink-0"
                      >
                        {t('form.choose_file')}
                      </Button>
                      <span className="text-sm text-muted-foreground truncate">
                        {formData.image?.name || t('form.no_file_selected')}
                      </span>
                      <input
                        id="image"
                        type="file"
                        accept="image/*"
                        onChange={(e) => setFormData({ ...formData, image: e.target.files?.[0] || null })}
                        className="hidden"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="title">{t('form.title')} *</Label>
                    <Input
                      id="title"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder={t('form.title_placeholder')}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">{t('form.description')} *</Label>
                    <Textarea
                      id="description"
                      required
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder={t('form.description_placeholder')}
                      rows={5}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="goal_amount">{t('form.goal_amount')} *</Label>
                      <Input
                        id="goal_amount"
                        type="number"
                        required
                        min="1"
                        value={formData.goal_amount}
                        onChange={(e) => setFormData({ ...formData, goal_amount: e.target.value })}
                        placeholder={t('form.goal_amount_placeholder')}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">{t('form.category')} *</Label>
                      <Select 
                        required
                        value={formData.category}
                        onValueChange={(value) => setFormData({ ...formData, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t('form.select_category')} />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">{t('form.location')}</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder={t('form.location_placeholder')}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="end_date">{t('form.end_date')} *</Label>
                    <Input
                      id="end_date"
                      type="date"
                      required
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>

                  <Button type="submit" className="w-full">
                    {t('create_fundraiser')}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
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
            {filteredFundraisers.map((fundraiser) => {
              const progress = (fundraiser.current_amount / fundraiser.goal_amount) * 100;
              const daysLeft = Math.ceil((new Date(fundraiser.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

              return (
                <Card 
                  key={fundraiser.id} 
                  className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate(`/fundraiser/${fundraiser.id}`)}
                >
                  {fundraiser.image_url && (
                    <img
                      src={fundraiser.image_url}
                      alt={fundraiser.title}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-6 space-y-4">
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-semibold text-lg line-clamp-2">{fundraiser.title}</h3>
                        {fundraiser.verified && (
                          <Badge variant="default" className="flex-shrink-0">
                            <BadgeCheck className="h-3 w-3" />
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {fundraiser.description}
                      </p>
                      <div className="flex items-center gap-2 mb-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={fundraiser.profiles.avatar_url} />
                          <AvatarFallback>{fundraiser.profiles.full_name?.[0]}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-muted-foreground">{fundraiser.profiles.full_name}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">{getCategoryLabel(fundraiser.category)}</Badge>
                        {fundraiser.location && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {fundraiser.location}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-semibold text-primary">
                          ${fundraiser.current_amount.toLocaleString()}
                        </span>
                        <span className="text-muted-foreground">
                          {t('of')} ${fundraiser.goal_amount.toLocaleString()}
                        </span>
                      </div>
                      <Progress value={progress} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{Math.round(progress)}% {t('funded')}</span>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {daysLeft > 0 ? `${daysLeft} ${t('days_left')}` : t('ended')}
                        </div>
                      </div>
                    </div>

                    <Button 
                      className="w-full" 
                      variant="default"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDonate(fundraiser.id, fundraiser.title);
                      }}
                    >
                      <Heart className="h-4 w-4 mr-2" />
                      {t('donate_now')}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <DonationModal
        fundraiserId={selectedFundraiserId}
        fundraiserTitle={selectedFundraiserTitle}
        open={donationModalOpen}
        onOpenChange={setDonationModalOpen}
        onSuccess={fetchFundraisers}
      />
    </div>
  );
}
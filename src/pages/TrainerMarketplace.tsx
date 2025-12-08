import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, MapPin, Search, Award, DollarSign, Users, Calendar, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/ui";
import { useTranslation } from "react-i18next";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { SubscriptionGate } from "@/components/common";

interface TrainerProfile {
  id: string;
  user_id: string;
  bio: string;
  specialties: string[];
  certifications: string[];
  hourly_rate: number;
  experience_years: number;
  profile_image_url: string | null;
  location: string;
  rating: number;
  total_reviews: number;
  full_name?: string;
}

interface TrainerProgram {
  id: string;
  trainer_id: string;
  title: string;
  description: string;
  category: string;
  duration_weeks: number;
  price: number;
  program_type: string;
  difficulty_level: string;
  thumbnail_url: string | null;
}

const TrainerMarketplace = () => {
  const [trainers, setTrainers] = useState<TrainerProfile[]>([]);
  const [programs, setPrograms] = useState<TrainerProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const { t } = useTranslation('trainer');
  const navigate = useNavigate();

  useEffect(() => {
    fetchMarketplaceData();
  }, []);

  const fetchMarketplaceData = async () => {
    try {
      // Fetch trainers with profiles
      const { data: trainersData, error: trainersError } = await supabase
        .from('trainer_profiles')
        .select('*')
        .order('rating', { ascending: false });

      if (trainersError) throw trainersError;

      // Fetch profile names separately
      if (trainersData && trainersData.length > 0) {
        const userIds = trainersData.map(t => t.user_id);
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', userIds);

        // Merge the data
        const enrichedTrainers = trainersData.map(trainer => ({
          ...trainer,
          full_name: profilesData?.find(p => p.id === trainer.user_id)?.full_name || 'Trainer'
        }));

        setTrainers(enrichedTrainers);
      } else {
        setTrainers([]);
      }

      // Fetch programs
      const { data: programsData, error: programsError } = await supabase
        .from('trainer_programs')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (programsError) throw programsError;

      setPrograms(programsData || []);
    } catch (error: any) {
      toast({
        title: t('error'),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredTrainers = trainers.filter((trainer) =>
    trainer.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trainer.specialties.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredPrograms = programs.filter((program) =>
    program.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    program.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl">
        <Skeleton className="h-20 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <SubscriptionGate feature="trainer_search">
      <div className="space-y-6 max-w-7xl">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/premium')}
          className="shrink-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="p-3 bg-primary/10 rounded-xl">
          <Users className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">{t('trainer_marketplace')}</h1>
          <p className="text-muted-foreground">{t('find_trainers')}</p>
        </div>
      </div>

      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('search_placeholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      <Tabs defaultValue="trainers" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="trainers">{t('trainers')} ({filteredTrainers.length})</TabsTrigger>
          <TabsTrigger value="programs">{t('programs')} ({filteredPrograms.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="trainers" className="space-y-4 mt-6">
          {filteredTrainers.length === 0 ? (
            <Card className="p-12 text-center">
              <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">{t('no_trainers_found')}</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTrainers.map((trainer) => (
                <Card key={trainer.id} className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="flex items-start gap-4 mb-4">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={trainer.profile_image_url || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {trainer.full_name?.charAt(0) || 'T'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg truncate">{trainer.full_name}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span>{trainer.rating.toFixed(1)}</span>
                        <span>({trainer.total_reviews})</span>
                      </div>
                    </div>
                  </div>

                  {trainer.location && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                      <MapPin className="w-4 h-4" />
                      <span>{trainer.location}</span>
                    </div>
                  )}

                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {trainer.bio || t('no_bio')}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {trainer.specialties.slice(0, 3).map((specialty) => (
                      <Badge key={specialty} variant="secondary" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-primary" />
                      <span className="font-semibold">${trainer.hourly_rate}{t('per_hour')}</span>
                    </div>
                    <Button size="sm" className="bg-gradient-primary hover:opacity-90">
                      {t('view_profile')}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="programs" className="space-y-4 mt-6">
          {filteredPrograms.length === 0 ? (
            <Card className="p-12 text-center">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">{t('no_programs_found')}</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPrograms.map((program) => (
                <Card key={program.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                  {program.thumbnail_url && (
                    <div className="aspect-video bg-muted">
                      <img
                        src={program.thumbnail_url}
                        alt={program.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="outline">{program.category}</Badge>
                      <Badge variant="secondary">{program.difficulty_level}</Badge>
                    </div>
                    
                    <h3 className="font-semibold text-lg mb-2">{program.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {program.description}
                    </p>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{program.duration_weeks} {t('weeks')}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {program.program_type}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <span className="font-bold text-lg text-primary">${program.price}</span>
                      <Button size="sm" className="bg-gradient-primary hover:opacity-90">
                        {t('enroll_now')}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {trainers.length === 0 && programs.length === 0 && (
        <Card className="p-12 text-center bg-gradient-card">
          <Award className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">{t('be_first_trainer')}</h3>
          <p className="text-muted-foreground mb-6">
            {t('marketplace_starting')}
          </p>
          <Button onClick={() => navigate('/trainer/setup')} className="bg-gradient-primary hover:opacity-90">
            {t('become_trainer')}
          </Button>
        </Card>
      )}
    </div>
    </SubscriptionGate>
  );
};

export default TrainerMarketplace;

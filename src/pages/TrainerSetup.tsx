import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { Award, Plus, X, DollarSign, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { trainerProfileSchema, validateAndSanitize } from "@/lib/validation";

const TrainerSetup = () => {
  const [loading, setLoading] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const [bio, setBio] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [location, setLocation] = useState("");
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [newSpecialty, setNewSpecialty] = useState("");
  const [certifications, setCertifications] = useState<string[]>([]);
  const [newCertification, setNewCertification] = useState("");
  const { toast } = useToast();
  const { t } = useTranslation('trainer');
  const navigate = useNavigate();

  useEffect(() => {
    checkExistingProfile();
  }, []);

  const checkExistingProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('trainer_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profile) {
        setHasProfile(true);
        setBio(profile.bio || '');
        setHourlyRate(profile.hourly_rate?.toString() || '');
        setExperienceYears(profile.experience_years?.toString() || '');
        setLocation(profile.location || '');
        setSpecialties(profile.specialties || []);
        setCertifications(profile.certifications || []);
      }
    } catch (error) {
      console.error('Error checking profile:', error);
    }
  };

  const addSpecialty = () => {
    if (newSpecialty.trim() && !specialties.includes(newSpecialty.trim())) {
      setSpecialties([...specialties, newSpecialty.trim()]);
      setNewSpecialty("");
    }
  };

  const removeSpecialty = (specialty: string) => {
    setSpecialties(specialties.filter(s => s !== specialty));
  };

  const addCertification = () => {
    if (newCertification.trim() && !certifications.includes(newCertification.trim())) {
      setCertifications([...certifications, newCertification.trim()]);
      setNewCertification("");
    }
  };

  const removeCertification = (cert: string) => {
    setCertifications(certifications.filter(c => c !== cert));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Validate form data
      const validation = validateAndSanitize(trainerProfileSchema, {
        bio,
        hourly_rate: parseFloat(hourlyRate),
        experience_years: parseInt(experienceYears),
        location: location || undefined,
        specialties: specialties.length > 0 ? specialties : undefined,
        certifications: certifications.length > 0 ? certifications : undefined,
      });

      if (validation.success === false) {
        toast({
          title: t('validation_error'),
          description: validation.error,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const profileData = {
        user_id: user.id,
        ...validation.data,
      };

      if (hasProfile) {
        const { error } = await supabase
          .from('trainer_profiles')
          .update(profileData)
          .eq('user_id', user.id);

        if (error) throw error;

        toast({
          title: t('success'),
          description: t('profile_updated'),
        });
      } else {
        const { error } = await supabase
          .from('trainer_profiles')
          .insert([profileData]);

        if (error) throw error;

        toast({
          title: t('welcome_trainer'),
          description: t('profile_created'),
        });
      }

      navigate('/trainer/marketplace');
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

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-primary/10 rounded-xl">
          <Award className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">{t('trainer_profile_setup')}</h1>
          <p className="text-muted-foreground">
            {hasProfile ? t('update_profile') : t('create_profile_desc')}
          </p>
        </div>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="bio">{t('bio')} *</Label>
            <Textarea
              id="bio"
              placeholder={t('bio_placeholder')}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rate">{t('hourly_rate')} *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="rate"
                  type="number"
                  placeholder="50"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(e.target.value)}
                  className="pl-10"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="experience">{t('years_experience')} *</Label>
              <Input
                id="experience"
                type="number"
                placeholder="5"
                value={experienceYears}
                onChange={(e) => setExperienceYears(e.target.value)}
                min="0"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">{t('location')}</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="location"
                placeholder={t('location_placeholder')}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t('specialties')}</Label>
            <div className="flex gap-2">
              <Input
                placeholder={t('specialties_placeholder')}
                value={newSpecialty}
                onChange={(e) => setNewSpecialty(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSpecialty())}
              />
              <Button type="button" onClick={addSpecialty} variant="outline" size="icon">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {specialties.map((specialty) => (
                <Badge key={specialty} variant="secondary" className="gap-1">
                  {specialty}
                  <button
                    type="button"
                    onClick={() => removeSpecialty(specialty)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t('certifications')}</Label>
            <div className="flex gap-2">
              <Input
                placeholder={t('certifications_placeholder')}
                value={newCertification}
                onChange={(e) => setNewCertification(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCertification())}
              />
              <Button type="button" onClick={addCertification} variant="outline" size="icon">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {certifications.map((cert) => (
                <Badge key={cert} variant="secondary" className="gap-1">
                  {cert}
                  <button
                    type="button"
                    onClick={() => removeCertification(cert)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-primary hover:opacity-90"
            >
              {loading ? t('saving') : hasProfile ? t('update_profile_btn') : t('create_profile_btn')}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/trainer/marketplace')}
            >
              {t('cancel')}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default TrainerSetup;

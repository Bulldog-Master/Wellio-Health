import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DonationModal } from '@/components/social';
import { ArrowLeft, Heart, MapPin, Calendar, BadgeCheck, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

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
  created_at: string;
  user_id: string;
  profiles: {
    full_name: string;
    avatar_url: string;
  };
}

interface Donation {
  id: string;
  amount: number;
  message: string;
  is_anonymous: boolean;
  created_at: string;
  donor_id: string;
  profiles: {
    full_name: string;
    avatar_url: string;
  } | null;
}

export default function FundraiserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [fundraiser, setFundraiser] = useState<Fundraiser | null>(null);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [donationModalOpen, setDonationModalOpen] = useState(false);

  useEffect(() => {
    fetchFundraiserDetails();
  }, [id]);

  const fetchFundraiserDetails = async () => {
    try {
      const { data: fundraiserData, error: fundraiserError } = await supabase
        .from('fundraisers')
        .select(`
          *,
          profiles (full_name, avatar_url)
        `)
        .eq('id', id)
        .single();

      if (fundraiserError) throw fundraiserError;

      const { data: donationsData, error: donationsError } = await supabase
        .from('fundraiser_donations')
        .select(`
          *,
          profiles (full_name, avatar_url)
        `)
        .eq('fundraiser_id', id)
        .order('created_at', { ascending: false });

      if (donationsError) throw donationsError;

      setFundraiser(fundraiserData as any);
      setDonations((donationsData as any) || []);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load fundraiser details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !fundraiser) return;

    try {
      const shareText = `Support this cause: ${fundraiser.title}`;
      const shareUrl = window.location.href;

      await supabase.from('posts').insert({
        user_id: user.id,
        content: `${shareText}\n\n${shareUrl}`,
        post_type: 'text',
        is_public: true
      });

      toast.success('Shared to your feed!');
    } catch (error) {
      console.error('Share error:', error);
      toast.error('Failed to share');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-64 bg-muted rounded-lg" />
          <div className="h-8 bg-muted rounded w-3/4" />
          <div className="h-24 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (!fundraiser) {
    return (
      <div className="container mx-auto p-6 text-center">
        <p className="text-muted-foreground">Fundraiser not found</p>
        <Button onClick={() => navigate('/fundraisers')} className="mt-4">
          Back to Fundraisers
        </Button>
      </div>
    );
  }

  const progress = (fundraiser.current_amount / fundraiser.goal_amount) * 100;
  const daysLeft = Math.ceil((new Date(fundraiser.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate('/fundraisers')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Fundraisers
        </Button>

        <Card className="overflow-hidden">
          {fundraiser.image_url && (
            <img
              src={fundraiser.image_url}
              alt={fundraiser.title}
              className="w-full h-64 object-cover"
            />
          )}

          <div className="p-6 space-y-6">
            <div>
              <div className="flex items-start justify-between gap-4 mb-3">
                <h1 className="text-3xl font-bold">{fundraiser.title}</h1>
                {fundraiser.verified && (
                  <Badge variant="default" className="flex items-center gap-1">
                    <BadgeCheck className="h-3 w-3" />
                    Verified
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={fundraiser.profiles.avatar_url} />
                    <AvatarFallback>{fundraiser.profiles.full_name?.[0]}</AvatarFallback>
                  </Avatar>
                  <span>{fundraiser.profiles.full_name}</span>
                </div>
                {fundraiser.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {fundraiser.location}
                  </div>
                )}
                <Badge variant="secondary">{fundraiser.category}</Badge>
              </div>

              <div className="bg-card-subtle p-4 rounded-lg space-y-3">
                <div className="flex justify-between items-baseline">
                  <span className="text-2xl font-bold text-primary">
                    ${fundraiser.current_amount.toLocaleString()}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    of ${fundraiser.goal_amount.toLocaleString()} goal
                  </span>
                </div>
                <Progress value={progress} className="h-2" />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{donations.length} donations</span>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {daysLeft > 0 ? `${daysLeft} days left` : 'Ended'}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setDonationModalOpen(true)}
                className="flex-1"
                size="lg"
              >
                <Heart className="h-4 w-4 mr-2" />
                Donate Now
              </Button>
              <Button
                onClick={handleShare}
                variant="outline"
                size="lg"
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="prose prose-sm max-w-none">
              <h2 className="text-xl font-semibold mb-3">About this fundraiser</h2>
              <p className="text-muted-foreground whitespace-pre-wrap">{fundraiser.description}</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Recent Donations ({donations.length})</h2>
              <div className="space-y-3">
                {donations.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Be the first to donate!
                  </p>
                ) : (
                  donations.map((donation) => (
                    <Card key={donation.id} className="p-4">
                      <div className="flex items-start gap-3">
                        <Avatar>
                          <AvatarImage src={donation.is_anonymous ? undefined : donation.profiles?.avatar_url} />
                          <AvatarFallback>
                            {donation.is_anonymous ? '?' : donation.profiles?.full_name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline justify-between gap-2">
                            <p className="font-medium">
                              {donation.is_anonymous ? 'Anonymous' : donation.profiles?.full_name || 'Anonymous'}
                            </p>
                            <p className="font-bold text-primary">${donation.amount}</p>
                          </div>
                          {donation.message && (
                            <p className="text-sm text-muted-foreground mt-1">{donation.message}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(new Date(donation.created_at), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>

      <DonationModal
        fundraiserId={fundraiser.id}
        fundraiserTitle={fundraiser.title}
        open={donationModalOpen}
        onOpenChange={setDonationModalOpen}
        onSuccess={fetchFundraiserDetails}
      />
    </div>
  );
}

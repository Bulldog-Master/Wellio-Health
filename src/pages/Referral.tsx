import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Share2, Copy, Check, Users, Gift } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Referral = () => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [referralCode] = useState("WELLIO-" + Math.random().toString(36).substr(2, 6).toUpperCase());
  const referralLink = `${window.location.origin}/auth?ref=${referralCode}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Referral link copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive",
      });
    }
  };

  const shareReferral = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join Wellio!",
          text: "Start your fitness journey with me on Wellio - track workouts, nutrition, and health goals!",
          url: referralLink,
        });
      } catch (error) {
        console.log("Share cancelled");
      }
    } else {
      copyToClipboard();
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-primary/10 rounded-xl">
          <Gift className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Referral Program</h1>
          <p className="text-muted-foreground">Invite friends and earn rewards</p>
        </div>
      </div>

      <Card className="p-8 bg-gradient-hero text-white shadow-glow-secondary">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm mb-2">
            <Users className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold">Share the Health Journey</h2>
          <p className="text-white/90 max-w-md mx-auto">
            Help your friends achieve their fitness goals and get rewarded for every person who joins!
          </p>
        </div>
      </Card>

      <Card className="p-6 bg-gradient-card shadow-md">
        <h3 className="text-lg font-semibold mb-4">Your Referral Link</h3>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={referralLink}
              readOnly
              className="font-mono text-sm"
            />
            <Button
              onClick={copyToClipboard}
              variant="outline"
              className="gap-2 min-w-[100px]"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy
                </>
              )}
            </Button>
          </div>
          <Button
            onClick={shareReferral}
            className="w-full gap-2 bg-gradient-primary hover:opacity-90 shadow-glow"
          >
            <Share2 className="w-4 h-4" />
            Share Referral Link
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 bg-gradient-card shadow-md text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-3">
            <Users className="w-6 h-6 text-primary" />
          </div>
          <h3 className="font-semibold mb-2">Total Referrals</h3>
          <p className="text-3xl font-bold text-primary">0</p>
        </Card>

        <Card className="p-6 bg-gradient-card shadow-md text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-secondary/10 mb-3">
            <Gift className="w-6 h-6 text-secondary" />
          </div>
          <h3 className="font-semibold mb-2">Rewards Earned</h3>
          <p className="text-3xl font-bold text-secondary">$0</p>
        </Card>

        <Card className="p-6 bg-gradient-card shadow-md text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent/10 mb-3">
            <Share2 className="w-6 h-6 text-accent" />
          </div>
          <h3 className="font-semibold mb-2">Active Users</h3>
          <p className="text-3xl font-bold text-accent">0</p>
        </Card>
      </div>

      <Card className="p-6 bg-gradient-card shadow-md">
        <h3 className="text-lg font-semibold mb-4">How It Works</h3>
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-bold flex-shrink-0">
              1
            </div>
            <div>
              <h4 className="font-semibold mb-1">Share Your Link</h4>
              <p className="text-sm text-muted-foreground">
                Copy your unique referral link and share it with friends via social media, email, or messaging apps.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-secondary/10 text-secondary font-bold flex-shrink-0">
              2
            </div>
            <div>
              <h4 className="font-semibold mb-1">Friends Sign Up</h4>
              <p className="text-sm text-muted-foreground">
                When someone uses your link to create an account, they'll be connected to your referral network.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-accent/10 text-accent font-bold flex-shrink-0">
              3
            </div>
            <div>
              <h4 className="font-semibold mb-1">Earn Rewards</h4>
              <p className="text-sm text-muted-foreground">
                Get exclusive benefits and rewards for every active user you refer. Both you and your friend benefit!
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Referral;

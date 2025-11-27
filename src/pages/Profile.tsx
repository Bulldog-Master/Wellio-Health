import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { User, Save, Share2, Copy, Check, Upload, Settings, ChevronDown, Shield, CreditCard, Bell, HelpCircle, UserCircle, Target, LogOut } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [referralCode] = useState("WELLIO-" + Math.random().toString(36).substr(2, 6).toUpperCase());
  const referralLink = `${window.location.origin}/auth?ref=${referralCode}`;
  const [isLoading, setIsLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [openPersonalInfo, setOpenPersonalInfo] = useState(true);
  const [openFitnessGoals, setOpenFitnessGoals] = useState(false);
  const [openSettings, setOpenSettings] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    age: "",
    gender: "male",
    height: "",
    heightUnit: "inches",
    weight: "",
    weightUnit: "lbs",
    targetWeight: "",
    targetWeightUnit: "lbs" as "lbs" | "kg",
    goal: "leaner",
    moveGoal: "500",
    exerciseGoal: "30",
    standGoal: "12"
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (profile) {
        setFormData(prev => ({
          ...prev,
          name: profile.full_name || "",
          username: profile.username || "",
          age: profile.age?.toString() || "",
          gender: profile.gender || "male",
          height: profile.height?.toString() || "",
          heightUnit: profile.height_unit || "inches",
          weight: profile.weight?.toString() || "",
          weightUnit: profile.weight_unit || "lbs",
          targetWeight: profile.target_weight?.toString() || "",
          targetWeightUnit: (profile.target_weight_unit as "lbs" | "kg") || "lbs",
          goal: profile.goal || "leaner",
          moveGoal: profile.move_goal?.toString() || "500",
          exerciseGoal: profile.exercise_goal?.toString() || "30",
          standGoal: profile.stand_goal?.toString() || "12"
        }));
        setAvatarUrl(profile.avatar_url);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          avatar_url: base64
        }, {
          onConflict: 'id'
        });

        if (error) throw error;

        setAvatarUrl(base64);
        toast({
          title: "Avatar updated",
          description: "Your profile picture has been updated.",
        });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Error",
        description: "Failed to upload avatar.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: formData.name,
          username: formData.username,
          age: formData.age ? parseInt(formData.age) : null,
          gender: formData.gender,
          height: formData.height ? parseFloat(formData.height) : null,
          height_unit: formData.heightUnit,
          weight: formData.weight ? parseFloat(formData.weight) : null,
          weight_unit: formData.weightUnit,
          target_weight: formData.targetWeight ? parseFloat(formData.targetWeight) : null,
          target_weight_unit: formData.targetWeightUnit,
          goal: formData.goal,
          move_goal: formData.moveGoal ? parseInt(formData.moveGoal) : 500,
          exercise_goal: formData.exerciseGoal ? parseInt(formData.exerciseGoal) : 30,
          stand_goal: formData.standGoal ? parseInt(formData.standGoal) : 12,
        }, {
          onConflict: 'id'
        });

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your profile information has been saved successfully.",
      });
    } catch (error: any) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error",
        description: error?.message || "Failed to save profile.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
          text: "Start your fitness journey with me on Wellio!",
          url: referralLink,
        });
      } catch (error) {
        console.log("Share cancelled");
      }
    } else {
      copyToClipboard();
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    } else {
      navigate("/auth");
    }
  };

  return (
    <div className="space-y-6 max-w-4xl pb-20">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-primary/10 rounded-xl">
          <User className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Profile</h1>
          <p className="text-muted-foreground">Manage your account</p>
        </div>
      </div>

      {/* Personal Information Section */}
      <Card className="bg-gradient-card shadow-md overflow-hidden">
        <Collapsible open={openPersonalInfo} onOpenChange={setOpenPersonalInfo}>
          <CollapsibleTrigger className="w-full p-6 flex items-center justify-between hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-secondary/20 rounded-lg">
                <UserCircle className="w-5 h-5 text-secondary" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-semibold">Personal Information</h3>
                <p className="text-sm text-muted-foreground">Your profile details and account info</p>
              </div>
            </div>
            <ChevronDown className={`w-5 h-5 transition-transform ${openPersonalInfo ? 'rotate-180' : ''}`} />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="p-6 pt-0 space-y-4 border-t">
              <div className="flex items-center gap-4 pb-4 border-b">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={avatarUrl || undefined} alt={formData.name} />
                  <AvatarFallback>
                    <User className="w-12 h-12" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading}
                    className="gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Upload Photo
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Doe"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="johndoe"
                  className="mt-1.5"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="height">Height</Label>
                  <div className="flex gap-2 mt-1.5">
                    <Input
                      id="height"
                      type="number"
                      value={formData.height}
                      onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                      className="flex-1"
                    />
                    <Select value={formData.heightUnit} onValueChange={(value) => setFormData({ ...formData, heightUnit: value })}>
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="inches">in</SelectItem>
                        <SelectItem value="cm">cm</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="weight">Current Weight</Label>
                  <div className="flex gap-2 mt-1.5">
                    <Input
                      id="weight"
                      type="number"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                      className="flex-1"
                    />
                    <Select value={formData.weightUnit} onValueChange={(value) => setFormData({ ...formData, weightUnit: value })}>
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lbs">lbs</SelectItem>
                        <SelectItem value="kg">kg</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Fitness Goals Section */}
      <Card className="bg-gradient-card shadow-md overflow-hidden">
        <Collapsible open={openFitnessGoals} onOpenChange={setOpenFitnessGoals}>
          <CollapsibleTrigger className="w-full p-6 flex items-center justify-between hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/20 rounded-lg">
                <Target className="w-5 h-5 text-accent" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-semibold">Fitness Goals</h3>
                <p className="text-sm text-muted-foreground">Your target weight and fitness objectives</p>
              </div>
            </div>
            <ChevronDown className={`w-5 h-5 transition-transform ${openFitnessGoals ? 'rotate-180' : ''}`} />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="p-6 pt-0 space-y-4 border-t">
              <div>
                <Label htmlFor="targetWeight">Target Weight</Label>
                <div className="flex gap-2 mt-1.5">
                  <Input
                    id="targetWeight"
                    type="number"
                    value={formData.targetWeight}
                    onChange={(e) => setFormData({ ...formData, targetWeight: e.target.value })}
                    placeholder="155"
                    className="flex-1"
                  />
                  <Select
                    value={formData.targetWeightUnit}
                    onValueChange={(value: "lbs" | "kg") => setFormData({ ...formData, targetWeightUnit: value })}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lbs">lbs</SelectItem>
                      <SelectItem value="kg">kg</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {formData.targetWeight && (
                  <p className="text-sm text-muted-foreground mt-2">
                    = {formData.targetWeightUnit === 'lbs'
                      ? `${(parseFloat(formData.targetWeight) * 0.453592).toFixed(1)} kg`
                      : `${(parseFloat(formData.targetWeight) * 2.20462).toFixed(1)} lbs`
                    }
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="goal">Primary Goal</Label>
                <Select value={formData.goal} onValueChange={(value) => setFormData({ ...formData, goal: value })}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="leaner">Get Leaner</SelectItem>
                    <SelectItem value="stronger">Build Strength</SelectItem>
                    <SelectItem value="cardio">Improve Cardio</SelectItem>
                    <SelectItem value="maintain">Maintain Weight</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-4 border-t">
                <h4 className="text-sm font-semibold mb-3 text-primary">Daily Activity Goals</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="moveGoal" className="text-xs">Move (Calories)</Label>
                    <Input
                      id="moveGoal"
                      type="number"
                      value={formData.moveGoal}
                      onChange={(e) => setFormData({ ...formData, moveGoal: e.target.value })}
                      placeholder="500"
                      className="mt-1.5"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Daily calorie burn goal</p>
                  </div>
                  <div>
                    <Label htmlFor="exerciseGoal" className="text-xs">Exercise (Minutes)</Label>
                    <Input
                      id="exerciseGoal"
                      type="number"
                      value={formData.exerciseGoal}
                      onChange={(e) => setFormData({ ...formData, exerciseGoal: e.target.value })}
                      placeholder="30"
                      className="mt-1.5"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Daily workout minutes</p>
                  </div>
                  <div>
                    <Label htmlFor="standGoal" className="text-xs">Stand (Hours)</Label>
                    <Input
                      id="standGoal"
                      type="number"
                      value={formData.standGoal}
                      onChange={(e) => setFormData({ ...formData, standGoal: e.target.value })}
                      placeholder="12"
                      className="mt-1.5"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Active hours per day</p>
                  </div>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Settings Section */}
      <Card className="bg-gradient-card shadow-md overflow-hidden">
        <Collapsible open={openSettings} onOpenChange={setOpenSettings}>
          <CollapsibleTrigger className="w-full p-6 flex items-center justify-between hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-lg">
                <Settings className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-semibold">Settings</h3>
                <p className="text-sm text-muted-foreground">Account preferences and configuration</p>
              </div>
            </div>
            <ChevronDown className={`w-5 h-5 transition-transform ${openSettings ? 'rotate-180' : ''}`} />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="border-t">
              {/* Profile Settings */}
              <button 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="w-full p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors text-left border-b"
              >
                <div className="p-2 bg-accent/20 rounded-lg">
                  <UserCircle className="w-5 h-5 text-accent" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">Profile</h4>
                  <p className="text-sm text-muted-foreground">Manage your profile settings</p>
                </div>
              </button>

              {/* Privacy & Security */}
              <button 
                onClick={() => navigate("/settings")}
                className="w-full p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors text-left border-b"
              >
                <div className="p-2 bg-destructive/20 rounded-lg">
                  <Shield className="w-5 h-5 text-destructive" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">Privacy & Security</h4>
                  <p className="text-sm text-muted-foreground">Control your privacy settings and security options</p>
                </div>
              </button>

              {/* Orders & Payments */}
              <button 
                onClick={() => navigate("/settings")}
                className="w-full p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors text-left border-b"
              >
                <div className="p-2 bg-warning/20 rounded-lg">
                  <CreditCard className="w-5 h-5 text-warning" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">Orders & Payments</h4>
                  <p className="text-sm text-muted-foreground">View your orders and manage payment methods</p>
                </div>
              </button>

              {/* Notifications */}
              <button 
                onClick={() => navigate("/settings")}
                className="w-full p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors text-left border-b"
              >
                <div className="p-2 bg-secondary/20 rounded-lg">
                  <Bell className="w-5 h-5 text-secondary" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">Notifications</h4>
                  <p className="text-sm text-muted-foreground">Configure your notification preferences</p>
                </div>
              </button>

              {/* Support */}
              <button 
                onClick={() => navigate("/settings")}
                className="w-full p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors text-left"
              >
                <div className="p-2 bg-primary/20 rounded-lg">
                  <HelpCircle className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">Support</h4>
                  <p className="text-sm text-muted-foreground">Get help and contact support</p>
                </div>
              </button>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Referral Link Card */}
      <Card className="p-6 bg-gradient-card shadow-md">
        <h3 className="text-lg font-semibold mb-4">Your Referral Link</h3>
        <p className="text-sm text-muted-foreground mb-4">Share Wellio with friends and earn rewards</p>
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              value={referralLink}
              readOnly
              className="font-mono text-sm"
            />
            <Button
              onClick={copyToClipboard}
              variant="outline"
              size="icon"
              className="shrink-0"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
          <Button
            onClick={shareReferral}
            variant="secondary"
            className="w-full gap-2"
          >
            <Share2 className="w-4 h-4" />
            Share Link
          </Button>
        </div>
      </Card>

      <div className="flex justify-between items-center">
        <Button onClick={handleSave} className="gap-2" disabled={isLoading}>
          <Save className="w-4 h-4" />
          Save Changes
        </Button>
        <Button onClick={handleLogout} variant="destructive" className="gap-2">
          <LogOut className="w-4 h-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
};

export default Profile;
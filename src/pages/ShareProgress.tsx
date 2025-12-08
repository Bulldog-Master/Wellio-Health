import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Share2, ArrowLeft, Copy, Check, Link, Clock, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/ui";
import { SEOHead } from "@/components/common";
import { addHours, addDays, format } from "date-fns";

const ShareProgress = () => {
  const { t } = useTranslation(['settings', 'common']);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [expiresIn, setExpiresIn] = useState('24h');
  const [selectedData, setSelectedData] = useState<Set<string>>(new Set(['weight', 'workouts']));

  const dataOptions = [
    { id: 'weight', label: t('weight_progress') },
    { id: 'workouts', label: t('workout_history') },
    { id: 'nutrition', label: t('nutrition_summary') },
    { id: 'steps', label: t('step_count') },
    { id: 'measurements', label: t('body_measurements') },
  ];

  const expiryOptions = [
    { value: '1h', label: t('one_hour') },
    { value: '24h', label: t('twentyfour_hours') },
    { value: '7d', label: t('seven_days') },
    { value: '30d', label: t('thirty_days') },
  ];

  const toggleData = (id: string) => {
    const newSelected = new Set(selectedData);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedData(newSelected);
  };

  const getExpiryDate = () => {
    const now = new Date();
    switch (expiresIn) {
      case '1h': return addHours(now, 1);
      case '24h': return addHours(now, 24);
      case '7d': return addDays(now, 7);
      case '30d': return addDays(now, 30);
      default: return addHours(now, 24);
    }
  };

  const generateShareLink = async () => {
    if (selectedData.size === 0) {
      toast({
        title: t('common:warning'),
        description: t('select_data_to_share'),
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: t('common:error'),
          description: t('please_login'),
          variant: "destructive",
        });
        return;
      }

      // Generate a unique share token
      const shareToken = crypto.randomUUID();
      const expiresAt = getExpiryDate();

      // Store share token server-side for validation
      const { error } = await supabase
        .from('progress_shares')
        .insert({
          user_id: user.id,
          share_token: shareToken,
          allowed_data: [...selectedData],
          expires_at: expiresAt.toISOString(),
        });

      if (error) throw error;

      // Create the share link (no expiry in URL - validated server-side)
      const link = `${window.location.origin}/shared/${shareToken}`;
      setShareLink(link);

      toast({
        title: t('common:success'),
        description: t('share_link_created'),
      });
    } catch (error) {
      console.error('Error generating share link:', error);
      toast({
        title: t('common:error'),
        description: t('failed_generate_link'),
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyLink = () => {
    if (shareLink) {
      navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: t('common:copied'),
        description: t('link_copied'),
      });
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-xl">
            <Share2 className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{t('share_progress')}</h1>
            <p className="text-muted-foreground">{t('share_progress_desc')}</p>
          </div>
        </div>
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">{t('select_data_to_share')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {dataOptions.map((option) => (
            <div 
              key={option.id}
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <Checkbox 
                id={option.id}
                checked={selectedData.has(option.id)}
                onCheckedChange={() => toggleData(option.id)}
              />
              <Label htmlFor={option.id} className="cursor-pointer flex-1">
                {option.label}
              </Label>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">{t('link_expiry')}</h2>
        </div>
        <Select value={expiresIn} onValueChange={setExpiresIn}>
          <SelectTrigger className="w-full md:w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {expiryOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground mt-2">
          {t('expires_on', { date: format(getExpiryDate(), 'MMM d, yyyy h:mm a') })}
        </p>
      </Card>

      {shareLink ? (
        <Card className="p-6 bg-primary/5 border-primary/20">
          <div className="flex items-center gap-2 mb-4">
            <Link className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">{t('your_share_link')}</h2>
          </div>
          <div className="flex gap-2">
            <Input value={shareLink} readOnly className="font-mono text-sm" />
            <Button onClick={copyLink} variant="outline">
              {copied ? (
                <Check className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
          <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
            <Eye className="w-4 h-4" />
            {t('anyone_with_link')}
          </div>
          <Button 
            onClick={() => setShareLink(null)} 
            variant="ghost" 
            className="mt-4"
          >
            {t('create_another_link')}
          </Button>
        </Card>
      ) : (
        <div className="flex justify-end">
          <Button 
            onClick={generateShareLink} 
            disabled={isGenerating || selectedData.size === 0}
            size="lg"
          >
            {isGenerating ? (
              <>{t('generating')}</>
            ) : (
              <>
                <Share2 className="w-4 h-4 mr-2" />
                {t('generate_link')}
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ShareProgress;

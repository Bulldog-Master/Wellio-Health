import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Gift, Sparkles, Users, TrendingUp } from "lucide-react";
import { TrendingHashtag } from "@/hooks/social/useFeedData";

interface ReferralBannerProps {
  show: boolean;
  onHide: () => void;
}

export const ReferralBanner = ({ show, onHide }: ReferralBannerProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation(['social', 'feed']);

  if (!show) return null;

  return (
    <Card className="mb-6 overflow-hidden bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border-primary/20 animate-fade-in">
      <div className="p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="p-2 bg-gradient-to-br from-primary to-accent rounded-lg animate-pulse">
            <Gift className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              {t('get_1_month_pro_free')}
              <Sparkles className="w-4 h-4 text-primary" />
            </h3>
            <p className="text-xs text-muted-foreground">
              {t('invite_4_friends')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => navigate("/referral")}
            className="shrink-0"
          >
            <Users className="w-4 h-4 mr-2" />
            {t('share_link')}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onHide}
            className="shrink-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

interface TrendingHashtagsSidebarProps {
  hashtags: TrendingHashtag[] | undefined;
  onHashtagClick: (hashtag: string) => void;
}

export const TrendingHashtagsSidebar = ({ hashtags, onHashtagClick }: TrendingHashtagsSidebarProps) => {
  const { t } = useTranslation(['social', 'feed']);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          {t('trending_hashtags')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {hashtags && hashtags.length > 0 ? (
          hashtags.map(({ hashtag, count }) => (
            <button
              key={hashtag}
              onClick={() => onHashtagClick(hashtag)}
              className="w-full text-left p-2 rounded-lg hover:bg-accent transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">#{hashtag}</span>
                <Badge variant="secondary" className="text-xs">
                  {count} {t('posts').toLowerCase()}
                </Badge>
              </div>
            </button>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">{t('no_trending_hashtags')}</p>
        )}
      </CardContent>
    </Card>
  );
};

interface GroupsQuickAccessProps {}

export const GroupsQuickAccess = ({}: GroupsQuickAccessProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation(['social', 'feed']);

  return (
    <Card className="bg-gradient-card hover:shadow-xl transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          {t('fitness_groups')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          {t('join_groups_enthusiasts')}
        </p>
        <Button 
          onClick={() => navigate('/groups')} 
          className="w-full"
          variant="secondary"
        >
          {t('browse_groups')}
        </Button>
      </CardContent>
    </Card>
  );
};

interface ReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reason: string;
  onReasonChange: (reason: string) => void;
  details: string;
  onDetailsChange: (details: string) => void;
  onSubmit: () => void;
  isPending: boolean;
}

export const ReportDialog = ({
  open,
  onOpenChange,
  reason,
  onReasonChange,
  details,
  onDetailsChange,
  onSubmit,
  isPending,
}: ReportDialogProps) => {
  const { t } = useTranslation(['social', 'feed']);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('report_post')}</DialogTitle>
          <DialogDescription>
            {t('help_understand_wrong')}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">{t('reason')}</label>
            <Select value={reason} onValueChange={onReasonChange}>
              <SelectTrigger>
                <SelectValue placeholder={t('select_reason')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="spam">{t('spam')}</SelectItem>
                <SelectItem value="harassment">{t('harassment')}</SelectItem>
                <SelectItem value="hate">{t('hate_speech')}</SelectItem>
                <SelectItem value="violence">{t('violence')}</SelectItem>
                <SelectItem value="misinformation">{t('misinformation')}</SelectItem>
                <SelectItem value="other">{t('other')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium">{t('additional_details')}</label>
            <Textarea
              placeholder={t('tell_us_more')}
              value={details}
              onChange={(e) => onDetailsChange(e.target.value)}
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {t('cancel')}
            </Button>
            <Button
              onClick={onSubmit}
              disabled={!reason || isPending}
            >
              {isPending ? t('submitting') : t('submit_report')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

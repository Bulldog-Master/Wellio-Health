import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, User, Hash, X } from "lucide-react";
import { useTranslation } from "react-i18next";

interface FeedHeaderProps {
  selectedHashtag: string | null;
  onClearHashtagFilter: () => void;
}

export const FeedHeader = ({ selectedHashtag, onClearHashtagFilter }: FeedHeaderProps) => {
  const { t } = useTranslation(['social']);
  const navigate = useNavigate();

  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/connect")}
          className="hover:bg-primary/10"
          aria-label={t('back_to_connect')}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-xl">
            <User className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{t('community_feed')}</h1>
            <p className="text-muted-foreground mt-1">{t('share_fitness_journey')}</p>
          </div>
        </div>
      </div>
      {selectedHashtag && (
        <div className="flex items-center gap-2 mt-2">
          <Badge variant="secondary" className="text-sm">
            <Hash className="w-3 h-3 mr-1" />
            {selectedHashtag}
          </Badge>
          <Button variant="ghost" size="sm" onClick={onClearHashtagFilter}>
            <X className="w-4 h-4" />
            {t('clear_filter')}
          </Button>
        </div>
      )}
    </div>
  );
};

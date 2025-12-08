import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Eye, MousePointer } from 'lucide-react';
import type { Advertisement } from './types';

interface AdCardProps {
  ad: Advertisement;
  onEdit: (ad: Advertisement) => void;
  onDelete: (id: string) => void;
}

export function AdCard({ ad, onEdit, onDelete }: AdCardProps) {
  const { t } = useTranslation(['ads', 'common']);

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {ad.image_url && (
            <img
              src={ad.image_url}
              alt={ad.title}
              className="w-20 h-20 object-cover rounded"
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold">{ad.title}</h3>
              <Badge variant={ad.is_active ? "default" : "secondary"}>
                {ad.is_active ? t('common:active') : t('common:inactive')}
              </Badge>
              <Badge variant="outline">{t(`ads:admin.placements.${ad.placement}`)}</Badge>
            </div>
            {ad.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">{ad.description}</p>
            )}
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {ad.impression_count || 0} {t('ads:admin.impressions')}
              </span>
              <span className="flex items-center gap-1">
                <MousePointer className="h-4 w-4" />
                {ad.click_count || 0} {t('ads:admin.clicks')}
              </span>
            </div>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(ad)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(ad.id)}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

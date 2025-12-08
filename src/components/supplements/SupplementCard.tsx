import { Button } from "@/components/ui/button";
import { Pill, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Supplement } from "./types";

interface SupplementCardProps {
  supplement: Supplement;
  onDelete: (id: string) => void;
}

export const SupplementCard = ({ supplement, onDelete }: SupplementCardProps) => {
  const { t } = useTranslation('fitness');

  return (
    <div className="p-4 bg-secondary rounded-lg">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Pill className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold">{supplement.name}</h4>
              {supplement.category && (
                <span className="text-xs text-primary font-medium">
                  {supplement.category}
                </span>
              )}
            </div>
          </div>
          {supplement.description && (
            <p className="text-sm text-muted-foreground mb-2">{supplement.description}</p>
          )}
          <div className="grid grid-cols-2 gap-2 text-sm">
            {supplement.dosage && (
              <div>
                <span className="font-medium">{t('dosage')}:</span> {supplement.dosage}
              </div>
            )}
            {supplement.frequency && (
              <div>
                <span className="font-medium">{t('frequency')}:</span> {supplement.frequency}
              </div>
            )}
          </div>
          {supplement.product_link && (
            <a 
              href={supplement.product_link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline mt-2 inline-block"
            >
              {t('view_product')}
            </a>
          )}
          {supplement.notes && (
            <p className="text-sm text-muted-foreground mt-2 italic">{supplement.notes}</p>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(supplement.id)}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

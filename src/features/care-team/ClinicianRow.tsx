import { useTranslation } from 'react-i18next';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Stethoscope, UserX, Loader2 } from 'lucide-react';
import type { Professional } from './types';

interface ClinicianRowProps {
  clinician: Professional;
  onRevoke: (professional: Professional) => void;
  revoking: boolean;
}

export const ClinicianRow = ({ clinician, onRevoke, revoking }: ClinicianRowProps) => {
  const { t } = useTranslation(['professional', 'common']);

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarImage src={clinician.professional.avatar_url} />
          <AvatarFallback>
            {clinician.professional.display_name?.charAt(0) || '?'}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">{clinician.professional.display_name}</p>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              <Stethoscope className="w-3 h-3 mr-1" />
              {t('clinician')}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {t('since')} {new Date(clinician.started_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
      
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm"
            className="text-destructive hover:text-destructive"
          >
            <UserX className="w-4 h-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('revoke_access_title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('revoke_access_desc', { name: clinician.professional.display_name })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common:cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => onRevoke(clinician)}
              disabled={revoking}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {revoking && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {t('revoke_access')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

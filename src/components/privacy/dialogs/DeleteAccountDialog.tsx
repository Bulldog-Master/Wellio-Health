import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useTranslation } from "react-i18next";

interface DeleteAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

const DeleteAccountDialog = ({
  open,
  onOpenChange,
  onConfirm,
}: DeleteAccountDialogProps) => {
  const { t } = useTranslation('privacy');

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('delete_confirm')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('delete_warning')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm} 
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {t('delete_button')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteAccountDialog;

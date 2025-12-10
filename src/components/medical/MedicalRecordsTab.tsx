import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { Plus, FolderOpen, FileText } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { getSignedMedicalFileUrl } from '@/lib/storage';
import type { MedicalRecord, RecordFormData } from './types';

interface MedicalRecordsTabProps {
  medicalRecords: MedicalRecord[];
  isLoading: boolean;
  isUploading: boolean;
  onAddMedicalRecord: (formData: RecordFormData, file: File | null) => Promise<boolean>;
}

const initialFormData: RecordFormData = {
  record_name: '',
  record_date: new Date().toISOString().split('T')[0],
  category: '',
  notes: '',
  file_url: '',
};

export function MedicalRecordsTab({ medicalRecords, isLoading, isUploading, onAddMedicalRecord }: MedicalRecordsTabProps) {
  const { t } = useTranslation(['medical', 'common']);
  const { toast } = useToast();
  const [formData, setFormData] = useState<RecordFormData>(initialFormData);
  const [recordFile, setRecordFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 52428800) {
      toast({
        title: t('medical:file_too_large'),
        description: t('medical:file_size_limit'),
        variant: "destructive",
      });
      return;
    }

    setRecordFile(file);
  };

  const handleSubmit = async () => {
    const success = await onAddMedicalRecord(formData, recordFile);
    if (success) {
      setFormData(initialFormData);
      setRecordFile(null);
    }
  };

  const handleViewFile = async (record: MedicalRecord) => {
    const isEncrypted = (record.encryption_version || 0) >= 2;
    const signedUrl = await getSignedMedicalFileUrl(
      record.file_url_encrypted!,
      record.id,
      'medical_records',
      3600,
      isEncrypted
    );
    if (signedUrl) {
      window.open(signedUrl, '_blank');
      toast({
        title: "File Access Logged",
        description: "Medical file access has been recorded for audit purposes.",
      });
    } else {
      toast({
        title: t('medical:error'),
        description: "Failed to access file. The link may have expired.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-card shadow-md">
        <h3 className="text-lg font-semibold mb-6">{t('medical:add_record')}</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="record-name">{t('medical:record_name')}</Label>
            <Input
              id="record-name"
              placeholder={t('medical:placeholder_record_name')}
              value={formData.record_name}
              onChange={(e) => setFormData({ ...formData, record_name: e.target.value })}
              className="mt-1.5"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="record-date">Date</Label>
              <Input
                id="record-date"
                type="date"
                value={formData.record_date}
                onChange={(e) => setFormData({ ...formData, record_date: e.target.value })}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                placeholder="e.g., Lab Work, Imaging"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="mt-1.5"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="record-notes">Notes (optional)</Label>
            <Textarea
              id="record-notes"
              placeholder="Add any details..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="mt-1.5 min-h-20"
            />
          </div>

          <div>
            <Label htmlFor="record-file">Upload File (optional)</Label>
            <div className="flex gap-2 mt-1.5">
              <Input
                id="record-file"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={handleFileChange}
                className="flex-1"
              />
            </div>
            {recordFile && (
              <p className="text-xs text-muted-foreground mt-1">
                Selected: {recordFile.name} ({(recordFile.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Max file size: 50MB. Accepted formats: PDF, JPG, PNG, DOC, DOCX
            </p>
          </div>

          <Button onClick={handleSubmit} className="w-full gap-2" disabled={isUploading}>
            <Plus className="w-4 h-4" />
            {isUploading ? t('common:uploading') : t('medical:add_record')}
          </Button>
        </div>
      </Card>

      <Card className="p-6 bg-gradient-card shadow-md">
        <h3 className="text-lg font-semibold mb-4">Medical Records</h3>
        <div className="space-y-3">
          {isLoading ? (
            <p className="text-center text-muted-foreground py-8">Loading...</p>
          ) : medicalRecords.length > 0 ? (
            medicalRecords.map((record) => (
              <div key={record.id} className="p-4 bg-secondary rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-lg flex items-center gap-2">
                      <FolderOpen className="w-4 h-4" />
                      {record.record_name}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {record.category} • {format(new Date(record.record_date), "PP")}
                    </p>
                  </div>
                </div>
                {record.notes && (
                  <p className="text-sm text-muted-foreground mt-2">{record.notes}</p>
                )}
                {record.file_url_encrypted && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => handleViewFile(record)}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    {t('medical:view_file')}
                  </Button>
                )}
              </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground py-8">
              {t('medical:no_records')}
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}

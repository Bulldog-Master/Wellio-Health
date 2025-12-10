import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { Plus, FileText } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { getSignedMedicalFileUrl } from '@/lib/storage';
import type { TestResult, TestFormData } from './types';

interface TestResultsTabProps {
  testResults: TestResult[];
  isLoading: boolean;
  isUploading: boolean;
  onAddTestResult: (formData: TestFormData, file: File | null) => Promise<boolean>;
}

const initialFormData: TestFormData = {
  test_name: '',
  test_date: new Date().toISOString().split('T')[0],
  result_value: '',
  result_unit: '',
  notes: '',
  file_url: '',
};

export function TestResultsTab({ testResults, isLoading, isUploading, onAddTestResult }: TestResultsTabProps) {
  const { t } = useTranslation(['medical', 'common']);
  const { toast } = useToast();
  const [formData, setFormData] = useState<TestFormData>(initialFormData);
  const [testFile, setTestFile] = useState<File | null>(null);

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

    setTestFile(file);
  };

  const handleSubmit = async () => {
    const success = await onAddTestResult(formData, testFile);
    if (success) {
      setFormData(initialFormData);
      setTestFile(null);
    }
  };

  const handleViewFile = async (test: TestResult) => {
    const isEncrypted = (test.encryption_version || 0) >= 2;
    const signedUrl = await getSignedMedicalFileUrl(
      test.file_url_encrypted!,
      test.id,
      'medical_test_results',
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
        <h3 className="text-lg font-semibold mb-6">{t('medical:add_test_result')}</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="test-name">{t('medical:test_name')}</Label>
            <Input
              id="test-name"
              placeholder={t('medical:placeholder_test_name')}
              value={formData.test_name}
              onChange={(e) => setFormData({ ...formData, test_name: e.target.value })}
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor="test-date">{t('medical:test_date')}</Label>
            <Input
              id="test-date"
              type="date"
              value={formData.test_date}
              onChange={(e) => setFormData({ ...formData, test_date: e.target.value })}
              className="mt-1.5"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="result-value">{t('medical:result')}</Label>
              <Input
                id="result-value"
                placeholder={t('medical:placeholder_result')}
                value={formData.result_value}
                onChange={(e) => setFormData({ ...formData, result_value: e.target.value })}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="result-unit">Unit (optional)</Label>
              <Input
                id="result-unit"
                placeholder="e.g., mg/dL"
                value={formData.result_unit}
                onChange={(e) => setFormData({ ...formData, result_unit: e.target.value })}
                className="mt-1.5"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="test-notes">Notes (optional)</Label>
            <Textarea
              id="test-notes"
              placeholder="Add any details..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="mt-1.5 min-h-20"
            />
          </div>

          <div>
            <Label htmlFor="test-file">Upload File (optional)</Label>
            <div className="flex gap-2 mt-1.5">
              <Input
                id="test-file"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={handleFileChange}
                className="flex-1"
              />
            </div>
            {testFile && (
              <p className="text-xs text-muted-foreground mt-1">
                Selected: {testFile.name} ({(testFile.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Max file size: 50MB. Accepted formats: PDF, JPG, PNG, DOC, DOCX
            </p>
          </div>

          <Button onClick={handleSubmit} className="w-full gap-2" disabled={isUploading}>
            <Plus className="w-4 h-4" />
            {isUploading ? t('common:uploading') : t('medical:add_test_result')}
          </Button>
        </div>
      </Card>

      <Card className="p-6 bg-gradient-card shadow-md">
        <h3 className="text-lg font-semibold mb-4">Recent Test Results</h3>
        <div className="space-y-3">
          {isLoading ? (
            <p className="text-center text-muted-foreground py-8">Loading...</p>
          ) : testResults.length > 0 ? (
            testResults.map((test) => (
              <div key={test.id} className="p-4 bg-secondary rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-lg">{test.test_name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(test.test_date), "PP")}
                    </p>
                  </div>
                  {test.result_value && (
                    <span className="font-bold text-primary">
                      {test.result_value} {test.result_unit}
                    </span>
                  )}
                </div>
                {test.notes && (
                  <p className="text-sm text-muted-foreground mt-2">{test.notes}</p>
                )}
                {test.file_url_encrypted && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => handleViewFile(test)}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    {t('medical:view_file')}
                  </Button>
                )}
              </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground py-8">
              {t('medical:no_test_results')}
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}

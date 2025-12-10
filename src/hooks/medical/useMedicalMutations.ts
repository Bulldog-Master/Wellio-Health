import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { uploadMedicalFile } from '@/lib/storage';
import { 
  medicationSchema, 
  testResultSchema, 
  medicalRecordSchema, 
  symptomSchema, 
  validateAndSanitize 
} from '@/lib/validation';
import type { MedicationFormData, TestFormData, RecordFormData } from '@/components/medical/types';

export function useMedicalMutations(callbacks: {
  onMedicationAdded: () => void;
  onTestResultAdded: () => void;
  onMedicalRecordAdded: () => void;
  onSymptomAdded: () => void;
  onSymptomDeleted: () => void;
}) {
  const { t } = useTranslation(['medical', 'common']);
  const { toast } = useToast();
  const [isUploadingTest, setIsUploadingTest] = useState(false);
  const [isUploadingRecord, setIsUploadingRecord] = useState(false);

  const addMedication = async (formData: MedicationFormData) => {
    const validation = validateAndSanitize(medicationSchema, formData);
    if (validation.success === false) {
      toast({
        title: t('medical:validation_error'),
        description: validation.error,
        variant: "destructive",
      });
      return false;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from('medications')
        .insert({
          user_id: user.id,
          medication_name: formData.medication_name,
          dosage: formData.dosage,
          frequency: formData.frequency,
          start_date: formData.start_date,
          notes: formData.notes || null,
        });

      if (error) throw error;

      toast({
        title: t('medical:medication_added'),
        description: t('medical:medication_added_desc', { name: formData.medication_name }),
      });

      callbacks.onMedicationAdded();
      return true;
    } catch (error) {
      console.error('Error adding medication:', error);
      toast({
        title: t('medical:error'),
        description: t('medical:failed_add_medication'),
        variant: "destructive",
      });
      return false;
    }
  };

  const addTestResult = async (formData: TestFormData, file: File | null) => {
    const validation = validateAndSanitize(testResultSchema, formData);
    if (validation.success === false) {
      toast({
        title: t('medical:validation_error'),
        description: validation.error,
        variant: "destructive",
      });
      return false;
    }

    try {
      setIsUploadingTest(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      let encryptedFilePath: string | null = null;
      let encryptionVersion: number | null = null;

      if (file) {
        const uploadResult = await uploadMedicalFile(file, user.id, 'test_results');
        if (!uploadResult.success) {
          throw new Error(uploadResult.error || 'Failed to upload file');
        }
        encryptedFilePath = uploadResult.encryptedFilePath || uploadResult.filePath || null;
        encryptionVersion = uploadResult.encryptionVersion || null;
      }

      const { error } = await supabase
        .from('medical_test_results')
        .insert({
          user_id: user.id,
          test_name: formData.test_name,
          test_date: formData.test_date,
          result_value: formData.result_value || null,
          result_unit: formData.result_unit || null,
          notes: formData.notes || null,
          file_url_encrypted: encryptedFilePath,
          encryption_version: encryptionVersion,
        });

      if (error) throw error;

      toast({
        title: t('medical:test_result_added'),
        description: t('medical:test_result_added_desc', { name: formData.test_name }),
      });

      callbacks.onTestResultAdded();
      return true;
    } catch (error) {
      console.error('Error adding test result:', error);
      toast({
        title: t('medical:error'),
        description: t('medical:failed_add_test'),
        variant: "destructive",
      });
      return false;
    } finally {
      setIsUploadingTest(false);
    }
  };

  const addMedicalRecord = async (formData: RecordFormData, file: File | null) => {
    const validation = validateAndSanitize(medicalRecordSchema, formData);
    if (validation.success === false) {
      toast({
        title: t('medical:validation_error'),
        description: validation.error,
        variant: "destructive",
      });
      return false;
    }

    try {
      setIsUploadingRecord(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      let encryptedFilePath: string | null = null;
      let encryptionVersion: number | null = null;

      if (file) {
        const uploadResult = await uploadMedicalFile(file, user.id, 'medical_records');
        if (!uploadResult.success) {
          throw new Error(uploadResult.error || 'Failed to upload file');
        }
        encryptedFilePath = uploadResult.encryptedFilePath || uploadResult.filePath || null;
        encryptionVersion = uploadResult.encryptionVersion || null;
      }

      const { error } = await supabase
        .from('medical_records')
        .insert({
          user_id: user.id,
          record_name: formData.record_name,
          record_date: formData.record_date,
          category: formData.category,
          notes: formData.notes || null,
          file_url_encrypted: encryptedFilePath,
          encryption_version: encryptionVersion,
        });

      if (error) throw error;

      toast({
        title: t('medical:medical_record_added'),
        description: t('medical:medical_record_added_desc', { name: formData.record_name }),
      });

      callbacks.onMedicalRecordAdded();
      return true;
    } catch (error) {
      console.error('Error adding medical record:', error);
      toast({
        title: t('medical:error'),
        description: t('medical:failed_add_record'),
        variant: "destructive",
      });
      return false;
    } finally {
      setIsUploadingRecord(false);
    }
  };

  const addSymptom = async (symptomName: string, severity: number, description: string) => {
    const validation = validateAndSanitize(symptomSchema, {
      symptom_name: symptomName,
      severity,
      description: description || undefined,
    });
    if (validation.success === false) {
      toast({
        title: t('medical:validation_error'),
        description: validation.error,
        variant: "destructive",
      });
      return false;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from('symptoms')
        .insert({
          user_id: user.id,
          symptom_name: symptomName,
          severity,
          description: description || null,
        });

      if (error) throw error;

      toast({
        title: t('medical:symptom_logged'),
        description: t('medical:symptom_logged_desc', { name: symptomName }),
      });

      callbacks.onSymptomAdded();
      return true;
    } catch (error) {
      console.error('Error logging symptom:', error);
      toast({
        title: t('medical:error'),
        description: t('medical:failed_log_symptom'),
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteSymptom = async (id: string) => {
    try {
      const { error } = await supabase
        .from('symptoms')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: t('medical:symptom_deleted'),
        description: t('medical:symptom_deleted_desc'),
      });

      callbacks.onSymptomDeleted();
      return true;
    } catch (error) {
      console.error('Error deleting symptom:', error);
      toast({
        title: t('medical:error'),
        description: t('medical:failed_delete_symptom'),
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    addMedication,
    addTestResult,
    addMedicalRecord,
    addSymptom,
    deleteSymptom,
    isUploadingTest,
    isUploadingRecord,
  };
}

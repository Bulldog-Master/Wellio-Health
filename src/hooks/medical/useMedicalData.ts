import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Medication, TestResult, MedicalRecord, Symptom } from '@/components/medical/types';

export function useMedicalData() {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMedications = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('medications')
        .select('*')
        .eq('user_id', user.id)
        .order('start_date', { ascending: false });

      if (error) throw error;
      setMedications(data || []);
    } catch (error) {
      console.error('Error fetching medications:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchTestResults = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('medical_test_results')
        .select('*')
        .eq('user_id', user.id)
        .order('test_date', { ascending: false });

      if (error) throw error;
      setTestResults(data || []);
    } catch (error) {
      console.error('Error fetching test results:', error);
    }
  }, []);

  const fetchMedicalRecords = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('medical_records')
        .select('*')
        .eq('user_id', user.id)
        .order('record_date', { ascending: false });

      if (error) throw error;
      setMedicalRecords(data || []);
    } catch (error) {
      console.error('Error fetching medical records:', error);
    }
  }, []);

  const fetchSymptoms = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('symptoms')
        .select('*')
        .eq('user_id', user.id)
        .order('logged_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setSymptoms(data || []);
    } catch (error) {
      console.error('Error fetching symptoms:', error);
    }
  }, []);

  useEffect(() => {
    fetchMedications();
    fetchTestResults();
    fetchMedicalRecords();
    fetchSymptoms();
  }, [fetchMedications, fetchTestResults, fetchMedicalRecords, fetchSymptoms]);

  return {
    medications,
    testResults,
    medicalRecords,
    symptoms,
    isLoading,
    refetchMedications: fetchMedications,
    refetchTestResults: fetchTestResults,
    refetchMedicalRecords: fetchMedicalRecords,
    refetchSymptoms: fetchSymptoms,
  };
}

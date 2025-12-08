export interface Medication {
  id: string;
  medication_name: string;
  dosage: string;
  frequency: string;
  start_date: string;
  end_date: string | null;
  notes: string | null;
  is_active: boolean | null;
}

export interface TestResult {
  id: string;
  test_name: string;
  test_date: string;
  result_value: string | null;
  result_unit: string | null;
  notes: string | null;
  file_url_encrypted: string | null;
  encryption_version: number | null;
}

export interface MedicalRecord {
  id: string;
  record_name: string;
  record_date: string;
  category: string;
  notes: string | null;
  file_url_encrypted: string | null;
  encryption_version: number | null;
}

export interface Symptom {
  id: string;
  symptom_name: string;
  severity: number | null;
  description: string | null;
  logged_at: string | null;
}

export interface MedicationFormData {
  medication_name: string;
  dosage: string;
  frequency: string;
  start_date: string;
  notes: string;
}

export interface TestFormData {
  test_name: string;
  test_date: string;
  result_value: string;
  result_unit: string;
  notes: string;
  file_url: string;
}

export interface RecordFormData {
  record_name: string;
  record_date: string;
  category: string;
  notes: string;
  file_url: string;
}

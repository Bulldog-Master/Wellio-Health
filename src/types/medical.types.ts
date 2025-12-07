// Medical-related type definitions

export interface MedicalRecord {
  id: string;
  user_id: string;
  record_name: string;
  category: string;
  record_date: string;
  notes?: string;
  notes_encrypted?: string;
  file_url_encrypted?: string;
  encryption_version?: number;
  last_accessed_at?: string;
  created_at: string;
}

export interface MedicalTestResult {
  id: string;
  user_id: string;
  test_name: string;
  test_date: string;
  result_value?: string;
  result_unit?: string;
  notes?: string;
  file_url_encrypted?: string;
  encryption_version?: number;
  last_accessed_at?: string;
  created_at: string;
}

export interface Medication {
  id: string;
  user_id: string;
  medication_name: string;
  dosage: string;
  frequency: string;
  start_date: string;
  end_date?: string;
  notes?: string;
  is_active?: boolean;
  created_at: string;
}

export interface Symptom {
  id: string;
  user_id: string;
  symptom_name: string;
  severity: number;
  logged_at: string;
  notes?: string;
  triggers?: string[];
  created_at: string;
}

export interface RecoverySession {
  id: string;
  user_id: string;
  therapy_type: string;
  duration_minutes: number;
  intensity?: string;
  temperature?: number;
  location?: string;
  cost?: number;
  notes?: string;
  logged_at: string;
  created_at: string;
}

export type MedicalCategory = 
  | 'lab_results'
  | 'imaging'
  | 'prescriptions'
  | 'vaccinations'
  | 'allergies'
  | 'conditions'
  | 'procedures'
  | 'other';

export type TherapyType = 
  | 'massage'
  | 'red_light'
  | 'cold_plunge'
  | 'sauna'
  | 'oxygen_therapy'
  | 'cryotherapy'
  | 'float_tank'
  | 'compression'
  | 'infrared_sauna'
  | 'stretching';
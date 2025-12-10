export interface Professional {
  id: string;
  professional_id: string;
  professional_type: 'coach' | 'clinician';
  started_at: string;
  professional: {
    display_name: string;
    avatar_url?: string;
  };
}

export interface FoundProfessional {
  id: string;
  professional_id: string;
  professional_type: 'coach' | 'clinician';
  code: string;
  profile: {
    display_name: string;
    avatar_url?: string;
  };
}

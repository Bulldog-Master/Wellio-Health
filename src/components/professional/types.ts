export interface ProfessionalApplication {
  id: string;
  status: string;
  full_name: string;
  bio: string | null;
  specialties: string[] | null;
  certifications: string[] | null;
  years_experience: number | null;
  hourly_rate: number | null;
  location: string | null;
  website_url?: string | null;
}

export interface ProfessionalClient {
  id: string;
  client_id: string;
  status: string;
  started_at: string;
  profiles?: { full_name: string; avatar_url: string | null };
}

export interface ProfessionalFormData {
  full_name: string;
  email: string;
  phone: string;
  bio: string;
  specialties: string;
  certifications: string;
  years_experience: string;
  hourly_rate: string;
  location: string;
  website_url: string;
}

export type ProfessionalType = 'trainer' | 'practitioner';

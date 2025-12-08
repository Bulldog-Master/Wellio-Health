export type AdPlacement = 'dashboard' | 'activity' | 'feed' | 'news' | 'global';

export interface Advertisement {
  id: string;
  title: string;
  title_es: string | null;
  description: string | null;
  description_es: string | null;
  image_url: string | null;
  link_url: string | null;
  placement: AdPlacement;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  click_count: number | null;
  impression_count: number | null;
}

export interface AdFormData {
  title: string;
  title_es: string;
  description: string;
  description_es: string;
  image_url: string;
  link_url: string;
  placement: AdPlacement;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

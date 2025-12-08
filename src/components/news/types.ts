import { LucideIcon } from 'lucide-react';

export interface NewsItem {
  id: string;
  category: string;
  title: string;
  title_es: string | null;
  url: string;
  event_date: string | null;
  event_date_es: string | null;
  badge_type: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface NewsCategory {
  id: string;
  icon: LucideIcon;
  titleKey: string;
  descKey: string;
  color: string;
  bgColor: string;
}

export interface NewsFormData {
  title: string;
  title_es: string;
  url: string;
  event_date: string;
  event_date_es: string;
  badge_type: string;
  category: string;
}

export const defaultFormData: NewsFormData = {
  title: '',
  title_es: '',
  url: '',
  event_date: '',
  event_date_es: '',
  badge_type: 'upcoming',
  category: 'latest'
};

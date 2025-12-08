export interface Fundraiser {
  id: string;
  title: string;
  description: string;
  goal_amount: number;
  current_amount: number;
  category: string;
  location: string;
  image_url: string;
  verified: boolean;
  end_date: string;
  user_id: string;
  status: string;
  profiles: {
    full_name: string;
    avatar_url: string;
  };
}

export interface FundraiserFormData {
  title: string;
  description: string;
  goal_amount: string;
  category: string;
  location: string;
  end_date: string;
  image: File | null;
}

export const defaultFormData: FundraiserFormData = {
  title: '',
  description: '',
  goal_amount: '',
  category: '',
  location: '',
  end_date: '',
  image: null
};

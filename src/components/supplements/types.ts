export interface Supplement {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  dosage: string | null;
  frequency: string | null;
  product_link: string | null;
  notes: string | null;
  is_active: boolean | null;
}

export interface SupplementFormData {
  name: string;
  description: string;
  category: string;
  dosage: string;
  frequency: string;
  product_link: string;
  notes: string;
}

export interface PopularSupplement {
  name: string;
  description: string;
  category: string;
}

export const popularSupplements: PopularSupplement[] = [
  { name: "Vitamin D3", description: "Supports bone health and immunity", category: "Vitamin" },
  { name: "Omega-3 Fish Oil", description: "Heart and brain health support", category: "Essential Fatty Acid" },
  { name: "Multivitamin", description: "Daily nutritional foundation", category: "Vitamin Complex" },
  { name: "Protein Powder", description: "Muscle recovery and growth", category: "Protein" },
  { name: "Magnesium", description: "Sleep and muscle function", category: "Mineral" },
  { name: "Vitamin B Complex", description: "Energy and metabolism support", category: "Vitamin" },
];

export const initialFormData: SupplementFormData = {
  name: "",
  description: "",
  category: "",
  dosage: "",
  frequency: "",
  product_link: "",
  notes: "",
};

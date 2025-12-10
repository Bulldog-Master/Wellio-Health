/**
 * Professional Billing Configuration
 * 
 * Defines tier structures for coaches and clinicians.
 * This skeleton is ready for Stripe integration.
 */

export interface ProfessionalTier {
  id: string;
  name: string;
  priceMonthly: number;
  priceYearly: number;
  features: string[];
  maxClients: number | null; // null = unlimited
  stripePriceIdMonthly?: string;
  stripePriceIdYearly?: string;
}

export const COACH_TIERS: ProfessionalTier[] = [
  {
    id: "coach_free",
    name: "Coach Free",
    priceMonthly: 0,
    priceYearly: 0,
    features: [
      "Up to 3 clients",
      "Basic FWI dashboard",
      "Secure messaging",
    ],
    maxClients: 3,
  },
  {
    id: "coach_pro",
    name: "Coach Pro",
    priceMonthly: 29,
    priceYearly: 290,
    features: [
      "Up to 25 clients",
      "Advanced analytics",
      "Video sessions",
      "Custom branding",
      "Priority support",
    ],
    maxClients: 25,
  },
  {
    id: "coach_team",
    name: "Coach Team",
    priceMonthly: 99,
    priceYearly: 990,
    features: [
      "Unlimited clients",
      "Team collaboration",
      "White-label options",
      "API access",
      "Dedicated support",
    ],
    maxClients: null,
  },
];

export const CLINICIAN_TIERS: ProfessionalTier[] = [
  {
    id: "clinician_individual",
    name: "Clinician Individual",
    priceMonthly: 0,
    priceYearly: 0,
    features: [
      "Up to 5 patients",
      "Functional wellness signals",
      "Secure messaging",
    ],
    maxClients: 5,
  },
  {
    id: "clinician_practice",
    name: "Group Practice",
    priceMonthly: 79,
    priceYearly: 790,
    features: [
      "Up to 100 patients",
      "Multi-practitioner support",
      "Advanced trend analysis",
      "HIPAA-compatible workflows",
      "Video consultations",
    ],
    maxClients: 100,
  },
  {
    id: "clinician_enterprise",
    name: "Enterprise",
    priceMonthly: 249,
    priceYearly: 2490,
    features: [
      "Unlimited patients",
      "Custom integrations",
      "EHR compatibility layer",
      "Dedicated success manager",
      "SLA guarantees",
    ],
    maxClients: null,
  },
];

export function getTierById(tierId: string): ProfessionalTier | undefined {
  return [...COACH_TIERS, ...CLINICIAN_TIERS].find(t => t.id === tierId);
}

export function getCoachTierByClientCount(clientCount: number): ProfessionalTier {
  if (clientCount <= 3) return COACH_TIERS[0];
  if (clientCount <= 25) return COACH_TIERS[1];
  return COACH_TIERS[2];
}

export function getClinicianTierByPatientCount(patientCount: number): ProfessionalTier {
  if (patientCount <= 5) return CLINICIAN_TIERS[0];
  if (patientCount <= 100) return CLINICIAN_TIERS[1];
  return CLINICIAN_TIERS[2];
}

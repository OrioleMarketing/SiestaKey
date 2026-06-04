/**
 * Stripe product and price definitions for Shop in Siesta Key directory plans.
 * These are created dynamically on first checkout if they don't exist in Stripe.
 */

export type PlanKey = "gulf_breeze" | "island_premier";

export interface PlanConfig {
  key: PlanKey;
  name: string;
  description: string;
  monthlyPrice: number; // in cents
  yearlyPrice: number;  // in cents
  features: string[];
  ghlTag: string;
}

export const PLANS: Record<PlanKey, PlanConfig> = {
  gulf_breeze: {
    key: "gulf_breeze",
    name: "Gulf Breeze",
    description: "Featured listing on Shop in Siesta Key directory",
    monthlyPrice: 4900, // $49.00
    yearlyPrice: 49000, // $490.00
    features: [
      "Full business profile",
      "Photo gallery",
      "Customer reviews",
      "Social media links",
      "Featured badge",
    ],
    ghlTag: "Gulf Breeze Plan",
  },
  island_premier: {
    key: "island_premier",
    name: "Island Premier",
    description: "Premium listing with AI Visibility Report on Shop in Siesta Key directory",
    monthlyPrice: 7900, // $79.00
    yearlyPrice: 79000, // $790.00
    features: [
      "Everything in Gulf Breeze",
      "Homepage spotlight",
      "Top search placement",
      "Sponsored badge",
      "Priority support",
      "AI Visibility Report ($299 value)",
    ],
    ghlTag: "Island Premier Plan",
  },
};

export type BillingInterval = "monthly" | "yearly";

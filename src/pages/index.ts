/**
 * Pages barrel export - organized by domain
 * 
 * This provides a clean import structure for all pages.
 * 
 * Directory Structure:
 * ├── admin/        - Admin dashboard pages (VIP, Payments, Professionals)
 * ├── ai/           - AI-powered feature pages (Insights, Analytics)
 * ├── challenges/   - Challenge and competition pages
 * ├── community/    - Community feature pages (Fundraisers, Locations)
 * ├── core/         - Core application pages (Index, Auth, Dashboard)
 * ├── fitness/      - Fitness tracking pages (Workout, Recovery, etc.)
 * ├── legal/        - Legal document pages (Privacy, Terms, Refund)
 * ├── medical/      - Medical and health record pages
 * ├── nutrition/    - Nutrition tracking pages (Food, Recipes, Macros)
 * ├── payments/     - Payment and subscription pages
 * ├── professional/ - Professional portal pages (Trainer, Practitioner)
 * ├── settings/     - User settings pages
 * └── social/       - Social networking pages (Feed, Messages, Profile)
 * 
 * Note: Individual page files at root level use barrel exports from subdirectories.
 * New pages should be added to appropriate subdirectory and exported via its index.ts.
 */

export * from './core';
export * from './fitness';
export * from './nutrition';
export * from './social';
export * from './challenges';
export * from './settings';
export * from './payments';
export * from './medical';
export * from './professional';
export * from './legal';
export * from './community';
export * from './ai';

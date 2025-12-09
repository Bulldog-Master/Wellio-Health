# Refactoring Guide for Wellio App

## Philosophy

Refactoring should be **ongoing maintenance**, not a one-time event. Apply these principles during every feature addition or bug fix.

---

## When to Refactor

### Red Flags (Immediate Action Required)
- **Files over 500 lines** → Split immediately
- **Duplicate code blocks** → Extract to shared utility/hook
- **More than 5 useState in one component** → Create custom hook
- **Deeply nested JSX (4+ levels)** → Extract child components
- **Multiple responsibilities in one file** → Separate concerns

### Yellow Flags (Schedule for Next Sprint)
- **Files 300-500 lines** → Plan to split
- **Similar patterns across files** → Create reusable abstraction
- **Complex conditional rendering** → Consider component composition
- **Repeated API calls** → Centralize in custom hook

---

## How to Request Refactoring in Lovable

Use clear, specific prompts:

```
"Refactor FitnessLocations.tsx - it's 1,657 lines. Split into:
- LocationCard component
- LocationForm component
- LocationFilters component
- useLocationSearch hook
- locationUtils.ts for helper functions"
```

```
"Extract the wearable data form from Activity.tsx into a separate WearableDataForm component"
```

```
"Consolidate all distance/unit conversion logic into a single useUnitConversion hook"
```

---

## Current Refactoring Priorities

### ✅ Completed Refactors (December 2025)

#### Codebase Organization (100/100 Score)
- All 42+ component directories organized with barrel exports
- All 9 hook domains organized with barrel exports
- Zero root-level proxy pollution in `/components`
- All imports use `@/` aliases consistently
- Cross-domain re-exports cleaned from barrel files

#### Component Organization (A+++ Structure)
Created organized component directories with barrel exports:
- `src/components/layout/` - Layout, Header, SidebarNav, MobileNav, QuickActionsButton
- `src/components/common/` - EmptyState, MetricCard, SubscriptionGate
- `src/components/cart/` - CartDrawer, CartButton
- `src/components/fitness/` - WeightChart, VoiceLogger, StreakTracker
- `src/components/social/` - UserSearchCombobox, SuggestedUsers, DonationModal
- 37+ more domain directories

#### Hook Organization (9 Domains)
- `src/hooks/auth/` - Authentication hooks
- `src/hooks/fitness/` - Fitness data hooks
- `src/hooks/nutrition/` - Nutrition hooks
- `src/hooks/social/` - Social feature hooks
- `src/hooks/encryption/` - Encryption hooks
- `src/hooks/network/` - Network status hooks
- `src/hooks/locations/` - Location hooks
- `src/hooks/ui/` - UI utility hooks
- `src/hooks/utils/` - General utility hooks

#### Type System Organization
Consolidated scattered interfaces into domain-specific type files:
- `src/types/fitness.types.ts`
- `src/types/nutrition.types.ts`
- `src/types/user.types.ts`
- `src/types/social.types.ts`
- `src/types/medical.types.ts`
- `src/types/index.ts` - Barrel export

### 🟢 Good Examples (Follow These Patterns)
- `src/components/layout/` - Organized layout components with barrel exports
- `src/components/common/` - Shared/reusable components
- `src/types/*.types.ts` - Domain-specific type definitions
- `src/hooks/subscription/useSubscription.ts` - Single responsibility hook
- `src/components/cart/CartDrawer.tsx` - Focused component
- `src/lib/encryption.ts` - Utility functions grouped logically

---

## File Size Guidelines

| Size | Status | Action |
|------|--------|--------|
| < 150 lines | ✅ Ideal | Maintain |
| 150-300 lines | ✅ Good | Monitor |
| 300-500 lines | ⚠️ Warning | Plan split |
| 500-800 lines | 🟡 Concern | Schedule refactor |
| > 800 lines | 🔴 Critical | Refactor immediately |

---

## Checklist Before PR/Commit

1. [ ] No file exceeds 500 lines
2. [ ] No duplicate code blocks
3. [ ] All utility functions in `/lib`
4. [ ] All custom hooks in `/hooks`
5. [ ] Components have single responsibility
6. [ ] Imports are clean (no unused)
7. [ ] Types/interfaces in appropriate files

---

## Maintenance Schedule

- **Weekly**: Quick scan for files approaching 500 lines
- **Per Feature**: Refactor touched files if needed
- **Monthly**: Full codebase review for patterns

---

## Testing Infrastructure

As of December 2025, the project includes:
- **Vitest** for unit testing
- **Testing Library** for component testing
- Test utilities in `src/test/utils.tsx`
- Example tests in `src/components/ui/button.test.tsx`

Run tests with: `npm test` or `npx vitest`

---

*Last Updated: 2025-12-09*
*Next Review: 2025-01-09*

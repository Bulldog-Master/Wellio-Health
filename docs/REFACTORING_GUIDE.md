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

### ✅ Completed Refactors

#### FitnessLocations.tsx (1,657 → ~800 lines)
Extracted:
- `src/lib/locationUtils.ts` - Utility functions (calculateDistance, getCountryFlag, groupLocationsByCountry)
- `src/components/locations/LocationCard.tsx` - Individual location card component
- `src/components/locations/LocationForm.tsx` - Add/edit location form dialog
- `src/components/locations/DiscoveredGymCard.tsx` - External gym discovery card

#### Activity.tsx (797 → ~400 lines)
Extracted:
- `src/components/activity/ActivityFeatureCard.tsx` - Reusable feature card
- `src/components/activity/ActivityStatsGrid.tsx` - Weekly stats display
- `src/components/activity/WearableDataForm.tsx` - Wearable data input form

#### FoodLog.tsx (1,079 → ~600 lines)
Extracted:
- `src/hooks/useFoodLog.ts` - All data fetching and mutation logic

### 🟡 Remaining Warning (500-800 lines)
| File | Lines | Split Into |
|------|-------|------------|
| Workout.tsx | ~600 | WorkoutForm, WorkoutList, useWorkoutLog hook |

### 🟢 Good Examples (Follow These Patterns)
- `src/hooks/useSubscription.ts` - Single responsibility hook
- `src/hooks/useFoodLog.ts` - Data fetching hook (NEW)
- `src/components/cart/CartDrawer.tsx` - Focused component
- `src/components/locations/LocationCard.tsx` - Reusable card component (NEW)
- `src/lib/encryption.ts` - Utility functions grouped logically
- `src/lib/locationUtils.ts` - Domain-specific utilities (NEW)

---

## Refactoring Patterns

### 1. Extract Component Pattern
```tsx
// Before: Everything in one file
const BigPage = () => {
  return (
    <div>
      {/* 200 lines of header JSX */}
      {/* 300 lines of form JSX */}
      {/* 200 lines of list JSX */}
    </div>
  );
};

// After: Focused components
const BigPage = () => {
  return (
    <div>
      <PageHeader />
      <PageForm onSubmit={handleSubmit} />
      <ItemList items={items} />
    </div>
  );
};
```

### 2. Extract Hook Pattern
```tsx
// Before: State logic mixed in component
const Page = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => { /* fetch logic */ }, []);
  
  const handleCreate = async () => { /* create logic */ };
  const handleUpdate = async () => { /* update logic */ };
  const handleDelete = async () => { /* delete logic */ };
  
  // ... component JSX
};

// After: Hook encapsulates logic
const Page = () => {
  const { items, loading, error, create, update, remove } = useItems();
  // ... clean component JSX
};
```

### 3. Extract Utility Pattern
```tsx
// Before: Utility functions in component file
const calculateDistance = (lat1, lon1, lat2, lon2) => { /* ... */ };
const getCountryFlag = (country) => { /* ... */ };
const formatPrice = (price) => { /* ... */ };

// After: Separate utility file
// src/lib/locationUtils.ts
export const calculateDistance = (...) => { ... };
export const getCountryFlag = (...) => { ... };

// src/lib/formatUtils.ts
export const formatPrice = (...) => { ... };
```

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

*Last Updated: 2025-12-07*
*Next Review: 2025-01-07*

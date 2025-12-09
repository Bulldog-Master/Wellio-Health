# AI Privacy & Data Handling Policy

This document outlines what data is and is not sent to AI providers, anonymization practices, and PHI (Protected Health Information) boundaries.

## Overview

Wellio Health uses AI services for insights, recommendations, and coaching. This document ensures transparency about data handling and establishes strict boundaries for what information can be processed by external AI providers.

## AI Providers Used

| Provider | Service | Use Case |
|----------|---------|----------|
| Lovable AI (Gemini 2.5 Flash) | Insights, recommendations | Workout suggestions, nutrition analysis |
| OpenAI Realtime API | Voice coaching | Real-time workout companion (premium) |

## Data Categories

### ✅ Data That CAN Be Sent to AI Providers

These data types are anonymized/aggregated before transmission:

| Data Type | What's Sent | Example |
|-----------|-------------|---------|
| **Workout Statistics** | Aggregated metrics only | "5 workouts this week, avg 45 min, mostly cardio" |
| **Nutrition Summaries** | Calorie/macro totals | "2100 avg daily calories, 120g protein" |
| **Activity Trends** | Trend descriptions | "Step count declining over 2 weeks" |
| **Sleep Patterns** | Duration/quality scores | "Average 6.5 hours, quality score 72" |
| **Recovery Metrics** | Session counts/types | "3 recovery sessions: massage, cold plunge, sauna" |
| **Mood/Energy Scores** | Numeric ratings only | "Energy avg 3.5/5, mood avg 4/5 this week" |

### ❌ Data That MUST NEVER Be Sent to AI Providers

**PHI (Protected Health Information):**
- Medical records or file contents
- Medical test results (specific values)
- Diagnosis information
- Medication names or dosages
- Healthcare provider information
- Insurance or billing information

**PII (Personally Identifiable Information):**
- Full names
- Email addresses
- Phone numbers
- Physical addresses
- Dates of birth
- Profile photos or images
- Social Security numbers or government IDs

**Sensitive Combinations:**
- User ID + Medical condition
- Name + Health metrics
- Location + Health data
- Any data that could identify an individual when combined

## Implementation Guidelines

### Edge Function Requirements

All AI-calling edge functions MUST follow these rules:

```typescript
// ❌ WRONG - Never send raw user data
const prompt = `Analyze health data for ${user.name}: 
  Medical conditions: ${user.medicalRecords}`;

// ✅ CORRECT - Send only anonymized summaries
const prompt = `Based on the following anonymized health metrics:
  - Average daily steps: ${metrics.avgSteps}
  - Weekly workout count: ${metrics.workoutCount}
  - Sleep quality score: ${metrics.sleepScore}
  Provide general wellness recommendations.`;
```

### Anonymization Functions

Use these patterns in edge functions:

```typescript
// Anonymize workout data before AI processing
function anonymizeWorkoutData(workouts: Workout[]) {
  return {
    totalCount: workouts.length,
    avgDuration: average(workouts.map(w => w.duration_minutes)),
    types: countByType(workouts.map(w => w.activity_type)),
    weeklyTrend: calculateTrend(workouts),
    // NEVER include: user_id, exact dates, location, notes
  };
}

// Anonymize nutrition data
function anonymizeNutritionData(meals: NutritionLog[]) {
  return {
    avgCalories: average(meals.map(m => m.calories)),
    avgProtein: average(meals.map(m => m.protein_grams)),
    avgCarbs: average(meals.map(m => m.carbs_grams)),
    avgFat: average(meals.map(m => m.fat_grams)),
    mealFrequency: meals.length / 7, // per day
    // NEVER include: food_name, notes, image_url
  };
}
```

### Current Edge Functions Compliance

| Function | Status | Notes |
|----------|--------|-------|
| `generate-insights` | ✅ Compliant | Uses aggregated metrics only |
| `ai-workout-recommendations` | ✅ Compliant | Sends workout counts/types only |
| `ai-meal-suggestions` | ✅ Compliant | Uses calorie/macro summaries |
| `predict-injury-risk` | ✅ Compliant | Analyzes patterns, not raw data |
| `emotion-fitness-analysis` | ✅ Compliant | Numeric scores only |
| `realtime-voice-token` | ⚠️ Special | Voice data processed in real-time, not stored by AI |

## Voice Data Handling

For the AI Voice Workout Companion:

- Audio is streamed directly to OpenAI Realtime API
- Audio is processed in real-time and not stored by OpenAI
- No transcripts are stored on our servers
- User can opt out of voice features at any time
- Voice sessions are not linked to identifiable user data in AI context

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        User App (Client)                        │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Edge Function (Server)                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Anonymization Layer                         │   │
│  │  • Strip user IDs, names, emails                        │   │
│  │  • Aggregate metrics (averages, counts, trends)         │   │
│  │  • Remove timestamps that could identify individuals    │   │
│  │  • Never forward medical records or PHI                 │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼ (Anonymized data only)
┌─────────────────────────────────────────────────────────────────┐
│                      AI Provider (External)                      │
│  • Receives only aggregated/anonymized metrics                  │
│  • Cannot identify individual users                             │
│  • Cannot access raw health records                             │
└─────────────────────────────────────────────────────────────────┘
```

## Audit Checklist

Before deploying any AI feature, verify:

- [ ] No user IDs are included in AI prompts
- [ ] No names, emails, or PII in AI context
- [ ] Medical records content is NEVER sent
- [ ] Data is aggregated (averages, counts, trends)
- [ ] Timestamps are relative ("this week") not absolute
- [ ] AI response storage doesn't create new PII
- [ ] User can opt out of AI features

## Incident Response

If PHI is accidentally sent to an AI provider:

1. **Immediately** disable the affected edge function
2. Document the incident in `security_logs`
3. Contact the AI provider about data deletion
4. Notify affected users per HIPAA/GDPR requirements
5. Review and fix the data handling code
6. Update this document with lessons learned

## Updates

This document should be reviewed and updated:
- When adding new AI features
- When changing AI providers
- After any security audit
- Quarterly at minimum

---

*Last Updated: December 2024*
*Document Owner: Security Team*

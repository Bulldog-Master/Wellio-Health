// Types barrel export
// Note: Some types in shared.ts are kept for backwards compatibility
// New code should use the domain-specific type files

export * from './fitness.types';
export * from './nutrition.types';
export * from './user.types';
export * from './social.types';
export * from './medical.types';

// Re-export specific types from shared.ts that aren't duplicated
export type { 
  User,
  Workout,
  Challenge,
  LoadingState,
  PaginationState 
} from './shared';
/**
 * Shared types for Supabase Edge Functions
 * Centralized type definitions to ensure consistency across all edge functions
 */

// Common response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ErrorResponse {
  error: string;
  status: number;
  details?: string;
}

// Authentication types
export interface AuthenticatedUser {
  id: string;
  email?: string;
  role?: string;
}

// AI/ML types
export interface AIAnalysisRequest {
  userId: string;
  data: Record<string, unknown>;
  options?: AIAnalysisOptions;
}

export interface AIAnalysisOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AIAnalysisResponse {
  insights: string[];
  recommendations?: string[];
  score?: number;
  metadata?: Record<string, unknown>;
}

// Meal analysis types
export interface MealAnalysisRequest {
  imageBase64?: string;
  description?: string;
  userId: string;
}

export interface MealAnalysisResult {
  foodName: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  confidence: number;
}

// Workout types
export interface WorkoutRecommendation {
  id: string;
  name: string;
  description: string;
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  muscleGroups: string[];
  equipment: string[];
}

// Payment types
export interface PaymentRequest {
  userId: string;
  amount: number;
  currency: string;
  method: string;
  metadata?: Record<string, unknown>;
}

export interface PaymentResult {
  transactionId: string;
  status: 'pending' | 'completed' | 'failed';
  amount: number;
  currency: string;
}

// Geocoding types
export interface GeocodingResult {
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  country?: string;
}

// Wearable sync types
export interface WearableSyncRequest {
  userId: string;
  provider: 'fitbit' | 'garmin' | 'oura' | 'suunto' | 'whoop';
  accessToken: string;
  refreshToken?: string;
}

export interface WearableSyncResult {
  steps?: number;
  calories?: number;
  heartRate?: number;
  sleepHours?: number;
  syncedAt: string;
}

// Voice/Speech types
export interface VoiceToTextRequest {
  audioBase64: string;
  language?: string;
}

export interface VoiceToTextResult {
  text: string;
  confidence: number;
  language: string;
}

// TOTP/2FA types
export interface TOTPSetupResult {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

export interface TOTPVerifyRequest {
  userId: string;
  code: string;
}

// Medical encryption types
export interface EncryptionRequest {
  data: string;
  userId: string;
}

export interface EncryptionResult {
  encrypted: string;
  version: number;
}

// Rate limiting types
export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  identifier: string;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

// Utility function types
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS';

export interface CorsHeaders {
  'Access-Control-Allow-Origin': string;
  'Access-Control-Allow-Headers': string;
  'Access-Control-Allow-Methods': string;
}

// Standard CORS headers for edge functions
export const corsHeaders: CorsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

// Helper to create standard JSON response
export function createJsonResponse<T>(data: T, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// Helper to create error response
export function createErrorResponse(error: string, status = 400): Response {
  return new Response(JSON.stringify({ error }), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

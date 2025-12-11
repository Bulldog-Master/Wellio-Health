import { z } from 'zod';

/**
 * Post metadata validation schema
 * Defines allowed metadata keys and their formats for posts
 * Defense-in-depth: Database trigger also validates metadata
 */
export const postMetadataSchema = z.object({
  // Optional tags array (max 10 tags, max 50 chars each)
  tags: z.array(z.string().max(50)).max(10).optional(),
  
  // Optional category
  category: z.string().max(100).optional(),
  
  // Optional visibility settings
  visibility: z.enum(['public', 'followers', 'close_friends', 'private']).optional(),
  
  // Optional link preview data
  link_preview: z.object({
    url: z.string().url().max(2000).optional(),
    title: z.string().max(200).optional(),
    description: z.string().max(500).optional(),
    image: z.string().url().max(2000).optional(),
  }).optional(),
  
  // Optional poll data
  poll: z.object({
    question: z.string().max(200).optional(),
    options: z.array(z.string().max(100)).max(4).optional(),
    ends_at: z.string().datetime().optional(),
  }).optional(),
}).strict().optional(); // strict() rejects unknown keys

/**
 * Validate post metadata
 * Returns validated metadata or null if invalid
 */
export const validatePostMetadata = (metadata: unknown): z.infer<typeof postMetadataSchema> | null => {
  try {
    // Size check first (10KB limit)
    const serialized = JSON.stringify(metadata);
    if (serialized.length > 10000) {
      console.warn('Post metadata exceeds size limit');
      return null;
    }
    
    const result = postMetadataSchema.safeParse(metadata);
    if (!result.success) {
      console.warn('Invalid post metadata:', result.error.issues);
      return null;
    }
    return result.data;
  } catch {
    return null;
  }
};

/**
 * Sanitize metadata by removing any disallowed keys
 * Returns safe metadata object
 */
export const sanitizePostMetadata = (metadata: unknown): Record<string, unknown> => {
  if (!metadata || typeof metadata !== 'object') return {};
  
  const validated = validatePostMetadata(metadata);
  if (validated === null) return {};
  
  return validated as Record<string, unknown>;
};

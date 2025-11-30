import { supabase } from "@/integrations/supabase/client";

/**
 * Generates a signed URL for a medical file with time-limited access (1 hour)
 * @param filePath - The path to the file in storage
 * @returns Signed URL or null if error
 */
export async function getSignedMedicalFileUrl(filePath: string): Promise<string | null> {
  try {
    const { data, error } = await supabase.storage
      .from('medical-records')
      .createSignedUrl(filePath, 3600); // 1 hour expiry

    if (error) {
      console.error('Error generating signed URL:', error);
      return null;
    }

    return data.signedUrl;
  } catch (error) {
    console.error('Error in getSignedMedicalFileUrl:', error);
    return null;
  }
}

/**
 * Uploads a medical file to secure storage
 * @param file - The file to upload
 * @param userId - The user ID for organizing files
 * @param category - Category of the medical file (test_results, records, etc.)
 * @returns The file path in storage or null if error
 */
export async function uploadMedicalFile(
  file: File,
  userId: string,
  category: 'test_results' | 'medical_records'
): Promise<string | null> {
  try {
    const fileExt = file.name.split('.').pop();
    const timestamp = Date.now();
    const filePath = `${userId}/${category}/${timestamp}.${fileExt}`;

    const { error } = await supabase.storage
      .from('medical-records')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Error uploading file:', error);
      return null;
    }

    return filePath;
  } catch (error) {
    console.error('Error in uploadMedicalFile:', error);
    return null;
  }
}

/**
 * Deletes a medical file from storage
 * @param filePath - The path to the file in storage
 * @returns true if successful, false otherwise
 */
export async function deleteMedicalFile(filePath: string): Promise<boolean> {
  try {
    const { error } = await supabase.storage
      .from('medical-records')
      .remove([filePath]);

    if (error) {
      console.error('Error deleting file:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteMedicalFile:', error);
    return false;
  }
}

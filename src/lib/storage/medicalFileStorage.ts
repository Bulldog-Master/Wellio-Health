import { supabase } from "@/integrations/supabase/client";
import { encryptMedicalData, decryptMedicalData, ENCRYPTION_VERSION } from "./medicalEncryption";

// Maximum file size: 10MB for medical files
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Allowed file types for medical records
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/msword', // .doc
];

/**
 * Logs access to medical files for audit trail (HIPAA compliance)
 * @param recordId - The database record ID
 * @param tableName - The table name (medical_test_results or medical_records)
 * @param action - The action performed (VIEW, DOWNLOAD, etc.)
 */
async function logMedicalFileAccess(
  recordId: string,
  tableName: string,
  action: string
): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('medical_audit_log').insert({
      user_id: user.id,
      record_id: recordId,
      table_name: tableName,
      action: action,
      ip_address: null, // Could be enhanced with actual IP if needed
      user_agent: navigator.userAgent,
    });
  } catch (error) {
    console.error('Error logging medical file access:', error);
    // Don't throw - audit logging failure shouldn't block access
  }
}

/**
 * Validates file before upload
 * @param file - The file to validate
 * @returns Object with isValid boolean and optional error message
 */
export function validateMedicalFile(file: File): { isValid: boolean; error?: string } {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`,
    };
  }

  // Check file type
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: 'File type not allowed. Please upload PDF, JPEG, PNG, or Word documents.',
    };
  }

  return { isValid: true };
}

/**
 * Encrypts a file path using quantum-resistant encryption
 * @param filePath - The plain text file path
 * @param recordId - Record ID for audit logging
 * @param tableName - Table name for audit logging
 * @returns Encrypted file path and encryption version
 */
export async function encryptFilePath(
  filePath: string,
  recordId?: string,
  tableName?: string
): Promise<{ encrypted: string; version: number }> {
  return encryptMedicalData(filePath, recordId, tableName);
}

/**
 * Decrypts an encrypted file path
 * @param encryptedPath - The encrypted file path
 * @param recordId - Record ID for audit logging
 * @param tableName - Table name for audit logging
 * @returns Decrypted file path
 */
export async function decryptFilePath(
  encryptedPath: string,
  recordId?: string,
  tableName?: string
): Promise<string> {
  return decryptMedicalData(encryptedPath, recordId, tableName);
}

/**
 * Generates a signed URL for a medical file with time-limited access
 * Logs access for audit trail (HIPAA compliance)
 * Now supports encrypted file paths
 * @param filePathOrEncrypted - The path to the file in storage (encrypted or plain)
 * @param recordId - The database record ID for audit logging
 * @param tableName - The table name for audit logging
 * @param expirySeconds - URL expiry time in seconds (default: 1 hour)
 * @param isEncrypted - Whether the file path is encrypted
 * @returns Signed URL or null if error
 */
export async function getSignedMedicalFileUrl(
  filePathOrEncrypted: string,
  recordId?: string,
  tableName?: string,
  expirySeconds: number = 3600,
  isEncrypted: boolean = false
): Promise<string | null> {
  try {
    // Log file access for audit trail
    if (recordId && tableName) {
      await logMedicalFileAccess(recordId, tableName, 'VIEW');
    }

    // Decrypt file path if encrypted
    let filePath = filePathOrEncrypted;
    if (isEncrypted) {
      try {
        filePath = await decryptFilePath(filePathOrEncrypted, recordId, tableName);
      } catch (decryptError) {
        console.error('Error decrypting file path:', decryptError);
        // Fall back to treating it as plain text (for backward compatibility)
        filePath = filePathOrEncrypted;
      }
    }

    // Update last_accessed_at timestamp
    if (recordId && tableName) {
      await supabase
        .from(tableName as 'medical_test_results' | 'medical_records')
        .update({ last_accessed_at: new Date().toISOString() })
        .eq('id', recordId);
    }

    const { data, error } = await supabase.storage
      .from('medical-records')
      .createSignedUrl(filePath, expirySeconds);

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
 * Generates a longer-lived signed URL for downloading files
 * @param filePath - The path to the file in storage
 * @param recordId - The database record ID for audit logging
 * @param tableName - The table name for audit logging
 * @param isEncrypted - Whether the file path is encrypted
 * @returns Signed URL with 5-minute expiry
 */
export async function getSignedMedicalDownloadUrl(
  filePath: string,
  recordId?: string,
  tableName?: string,
  isEncrypted: boolean = false
): Promise<string | null> {
  if (recordId && tableName) {
    await logMedicalFileAccess(recordId, tableName, 'DOWNLOAD');
  }
  return getSignedMedicalFileUrl(filePath, recordId, tableName, 300, isEncrypted); // 5 minutes
}

/**
 * Uploads a medical file to secure storage with validation
 * Now encrypts the file path before returning
 * @param file - The file to upload
 * @param userId - The user ID for organizing files
 * @param category - Category of the medical file (test_results, records, etc.)
 * @returns Object with success status, encrypted file path, encryption version, and optional error message
 */
export async function uploadMedicalFile(
  file: File,
  userId: string,
  category: 'test_results' | 'medical_records'
): Promise<{ 
  success: boolean; 
  filePath?: string; 
  encryptedFilePath?: string;
  encryptionVersion?: number;
  error?: string 
}> {
  try {
    // Validate file before upload
    const validation = validateMedicalFile(file);
    if (!validation.isValid) {
      return { success: false, error: validation.error };
    }

    const fileExt = file.name.split('.').pop();
    const timestamp = Date.now();
    // Sanitize filename to prevent path traversal
    const sanitizedExt = fileExt?.replace(/[^a-zA-Z0-9]/g, '') || 'bin';
    const filePath = `${userId}/${category}/${timestamp}.${sanitizedExt}`;

    const { error } = await supabase.storage
      .from('medical-records')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type,
      });

    if (error) {
      console.error('Error uploading file:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to upload file' 
      };
    }

    // Encrypt the file path using quantum-resistant encryption
    try {
      const encryptResult = await encryptMedicalData(filePath, 'new_upload', category);
      
      // Log upload action
      await logMedicalFileAccess('new_upload', category, 'UPLOAD');

      return { 
        success: true, 
        filePath,
        encryptedFilePath: encryptResult.encrypted,
        encryptionVersion: encryptResult.version
      };
    } catch (encryptError) {
      console.error('Error encrypting file path:', encryptError);
      // Return success with plain file path as fallback
      await logMedicalFileAccess('new_upload', category, 'UPLOAD');
      return { success: true, filePath };
    }
  } catch (error) {
    console.error('Error in uploadMedicalFile:', error);
    return { 
      success: false, 
      error: 'An unexpected error occurred during upload' 
    };
  }
}

/**
 * Deletes a medical file from storage with audit logging
 * Supports encrypted file paths
 * @param filePathOrEncrypted - The path to the file in storage (encrypted or plain)
 * @param recordId - The database record ID for audit logging
 * @param tableName - The table name for audit logging
 * @param isEncrypted - Whether the file path is encrypted
 * @returns true if successful, false otherwise
 */
export async function deleteMedicalFile(
  filePathOrEncrypted: string,
  recordId?: string,
  tableName?: string,
  isEncrypted: boolean = false
): Promise<boolean> {
  try {
    // Log deletion for audit trail
    if (recordId && tableName) {
      await logMedicalFileAccess(recordId, tableName, 'DELETE');
    }

    // Decrypt file path if encrypted
    let filePath = filePathOrEncrypted;
    if (isEncrypted) {
      try {
        filePath = await decryptFilePath(filePathOrEncrypted, recordId, tableName);
      } catch (decryptError) {
        console.error('Error decrypting file path for deletion:', decryptError);
        filePath = filePathOrEncrypted;
      }
    }

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

/**
 * Gets file metadata and access history
 * @param recordId - The database record ID
 * @param tableName - The table name
 * @returns Access logs for the file
 */
export async function getMedicalFileAccessHistory(
  recordId: string,
  tableName: string
): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('medical_audit_log')
      .select('*')
      .eq('record_id', recordId)
      .eq('table_name', tableName)
      .order('accessed_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching access history:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getMedicalFileAccessHistory:', error);
    return [];
  }
}

/**
 * Export encryption version for use in database inserts
 */
export { ENCRYPTION_VERSION };

import { supabase } from './supabaseClient';

/**
 * Uploads a file to Supabase Storage and returns the public URL.
 * @param file File to upload
 * @param bucketName Name of the Supabase Storage bucket (e.g., 'product-images')
 * @returns Public URL string or null if failed
 */
export async function uploadImageToSupabase(file: File, bucketName = 'product-images'): Promise<string | null> {
  if (!supabase) return null;
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
  const filePath = `${fileName}`;

  // Upload image
  const { data, error } = await supabase.storage.from(bucketName).upload(filePath, file, {
    cacheControl: '3600',
    upsert: false,
  });
  if (error) {
    console.error('Supabase image upload error:', error);
    return null;
  }

  // Get public URL
  const { data: publicUrlData } = supabase.storage.from(bucketName).getPublicUrl(filePath);
  return publicUrlData?.publicUrl || null;
}

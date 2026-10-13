import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://your-project.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "public-anon-key";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Public client for client-side queries, storage public reads, and authentication
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client for secure server-side operations (Next.js API routes, Server Actions, DB migrations)
export const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

// Helper to upload meme canvas export image directly to Supabase Storage
export async function uploadMemeToSupabaseStorage(
  fileBuffer: Blob | ArrayBuffer,
  fileName: string,
  bucketName = "memes"
) {
  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(`exports/${Date.now()}-${fileName}`, fileBuffer, {
      contentType: "image/png",
      upsert: true,
    });

  if (error) {
    console.error("Supabase Storage upload error:", error);
    throw error;
  }

  const { data: publicUrlData } = supabase.storage
    .from(bucketName)
    .getPublicUrl(data.path);

  return publicUrlData.publicUrl;
}

export default supabase;

import { createSupabaseComponentClient } from "./create-browser-client";

export async function sendNotification(userId: string, content: string) {
  const supabase = createSupabaseComponentClient();

  const { error } = await supabase.from("notification").insert({
    user_id: userId,
    content,
  });

  return { error };
}

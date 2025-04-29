import { createSupabaseComponentClient } from "./create-browser-client";

export async function placeBid(itemId: string, amount: number) {
  const supabase = createSupabaseComponentClient();

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();
  if (userErr || !user) {
    return { error: "You must be logged in to bid." };
  }

  const { error } = await supabase.from("bid").insert({
    item_id: itemId,
    bidder_id: user.id,
    amount,
  });

  return { error };
}

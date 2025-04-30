import { createSupabaseComponentClient } from "./create-browser-client";
import { sendNotification } from "./sendNotification";

export async function placeBid(itemId: string, amount: number) {
  const supabase = createSupabaseComponentClient();

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();
  if (userErr || !user) {
    return { error: "You must be logged in to bid." };
  }

  const { data: highestBids, error: highestBidErr } = await supabase
    .from("bid")
    .select("*")
    .eq("item_id", itemId)
    .order("amount", { ascending: false })
    .limit(1);

  if (highestBidErr) {
    return { error: highestBidErr };
  }

  const previousHighestBid = highestBids?.[0];

  const { error: bidError } = await supabase.from("bid").insert({
    item_id: itemId,
    bidder_id: user.id,
    amount,
  });

  if (bidError) {
    return { error: bidError };
  }

  if (previousHighestBid && previousHighestBid.bidder_id !== user.id) {
    await sendNotification(
      previousHighestBid.bidder_id,
      `You were outbid on an item!`
    );
  }

  return { error: null };
}

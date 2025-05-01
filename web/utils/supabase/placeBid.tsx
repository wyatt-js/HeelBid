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

  const { data: auctionData, error: itemErr } = await supabase
    .from("auction_item")
    .select("name")
    .eq("id", itemId)
    .single();

  if (itemErr || !auctionData) {
    return { error: itemErr || "Item not found." };
  }

  const auctionName = auctionData.name;

  const { data: overtakeData, error: overtakeError } = await supabase
    .from("profile")
    .select("username")
    .eq("id", previousHighestBid.bidder_id)
    .single();

  if (overtakeError || !overtakeData) {
    return { error: itemErr || "Item not found." };
  }

  const overtakeName = overtakeData.username;

  if (previousHighestBid && previousHighestBid.bidder_id !== user.id) {
    await sendNotification(
      previousHighestBid.bidder_id,
      `You were outbid on "${auctionName}" by ${overtakeName}!`
    );
  }

  return { error: null };
}

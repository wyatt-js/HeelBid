import { useEffect } from "react";
import { createSupabaseComponentClient } from "@/utils/supabase/create-browser-client";

type Bid = {
  id: string;
  item_id: string;
  bidder_id: string;
  amount: number;
  created_at: string;
};

export function BidListener({
  itemId,
  onNewBid,
}: {
  itemId: string;
  onNewBid: (bid: Bid) => void;
}) {
  useEffect(() => {
    const supabase = createSupabaseComponentClient();

    const channel = supabase
      .channel(`bids-${itemId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "bid",
          filter: `item_id=eq.${itemId}`,
        },
        (payload) => {
          onNewBid(payload.new as Bid);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [itemId, onNewBid]);

  return null;
}

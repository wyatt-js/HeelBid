import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export function useViewerCount(auctionId: string) {
  const [count, setCount] = useState(1);

  useEffect(() => {
    const channel = supabase.channel(`auction_viewers_${auctionId}`, {
      config: {
        presence: {
          key: `user_${Math.random().toString(36).substring(2, 8)}`,
        },
      },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const viewers = Object.keys(state).length;
        setCount(viewers);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({});
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [auctionId]);

  return count;
}

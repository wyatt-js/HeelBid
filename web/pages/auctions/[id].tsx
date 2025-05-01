import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { createSupabaseComponentClient } from "@/utils/supabase/create-browser-client";
import { placeBid } from "@/utils/supabase/placeBid";
import { BidListener } from "@/components/ui/bidListener";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useViewerCount } from "@/hooks/useViewerCount";
import { useBidUpdates } from "@/hooks/useBidUpdates";

type AuctionItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  end_time: string;
  state: string;
  image_url?: string;
};

type Bid = {
  id: string;
  item_id: string;
  bidder_id: string;
  amount: number;
  created_at: string;
  profile?: {
    username: string;
  };
};

export default function AuctionPage() {
  const { query, push } = useRouter();
  const itemId = query.id as string;

  const [item, setItem] = useState<AuctionItem | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);

  const [amount, setAmount] = useState("");
  const supabase = createSupabaseComponentClient();

  const viewerCount = useViewerCount(itemId);

  useEffect(() => {
    if (!itemId) return;

    const fetchData = async () => {
      const { data: itemData } = await supabase
        .from("auction_item")
        .select("*")
        .eq("id", itemId)
        .single();

      const { data: bidData } = await supabase
        .from("bid")
        .select("*, profile(username)")
        .eq("item_id", itemId)
        .order("amount", { ascending: false });

      setItem(itemData);
      setBids(bidData || []);
    };

    fetchData();
  }, [itemId]);

  // Viewer tracking logic
  useEffect(() => {
    if (!itemId) return;

    const registerViewer = async () => {
      const { data: userData } = await supabase.auth.getUser();
      await supabase.from("auction_viewer").upsert({
        user_id: userData?.user?.id || null,
        auction_id: itemId,
        expires_at: new Date(Date.now() + 30000).toISOString(),
      });
    };

    registerViewer();
    const interval = setInterval(registerViewer, 25000);
    return () => clearInterval(interval);
  }, [itemId]);

  const currentBid = bids[0]?.amount || item?.price || 0;

  const submitBid = async () => {
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= currentBid) {
      toast.error("Bid must be higher than the current bid.");
      return;
    }

    const { error } = await placeBid(itemId, amt);

    if (error) {
      toast.error(
        typeof error === "string" ? error : error?.message || "Unknown error"
      );
    } else {
      setAmount("");
      toast.success(`Your bid of $${amt.toFixed(2)} was submitted!`);
    }
  };

  const handleNewBid = async (newBid: Bid) => {
    const { data: profileData } = await supabase
      .from("profile")
      .select("username")
      .eq("id", newBid.bidder_id)
      .single();

    const enrichedBid: Bid = {
      ...newBid,
      profile: { username: profileData?.username || "Unknown" },
    };

    setBids((prev) => {
      const alreadyExists = prev.some((bid) => bid.id === enrichedBid.id);
      if (alreadyExists) return prev;
      return [enrichedBid, ...prev];
    });
  };

  useBidUpdates(itemId, handleNewBid);

  if (!item) return <div className="p-6">Loading auction...</div>;

  return (
    <>
      <div className="mb-4 p-8"></div>
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">{item.name}</h1>
          <Button onClick={() => push("/auctions/ongoing")}>
            ← Back to Auctions
          </Button>
        </div>
        <p className="text-muted-foreground">{item.description}</p>

        <p className="text-sm text-muted-foreground">
          👀 {viewerCount} {viewerCount === 1 ? "person is" : "people are"}{" "}
          viewing this auction
        </p>

        <div className="border p-4 rounded bg-background shadow">
          <h2 className="text-lg font-medium mb-2">Current Highest Bid</h2>
          <p className="text-3xl font-bold">${currentBid.toFixed(2)}</p>
        </div>

        <div className="flex gap-3 items-end">
          <Input
            type="number"
            min="0"
            value={amount}
            placeholder="Enter bid"
            onChange={(e) => setAmount(e.target.value)}
          />
          <Button onClick={submitBid}>Place Bid</Button>
        </div>

        <div>
          <h3 className="font-semibold text-sm mt-6 mb-2">Recent Bids</h3>
          <ul className="space-y-1 text-sm">
            {bids.map((bid) => (
              <li key={bid.id} className="border px-4 py-2 rounded">
                ${bid.amount.toFixed(2)} —{" "}
                {new Date(bid.created_at).toLocaleTimeString([], {
                  hour: "numeric",
                  minute: "numeric",
                  second: "numeric",
                })}{" "}
                -{" "}
                {bid.bidder_id === "me" ? (
                  <span className="text-green-500 font-semibold">You</span>
                ) : (
                  <span className="text-muted-foreground">
                    {bid.profile?.username || bid.bidder_id}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>

        <BidListener itemId={itemId} onNewBid={handleNewBid} />
      </div>
    </>
  );
}

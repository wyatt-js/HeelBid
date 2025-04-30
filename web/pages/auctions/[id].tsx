import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { createSupabaseComponentClient } from "@/utils/supabase/create-browser-client";
import { placeBid } from "@/utils/supabase/placeBid";
import { BidListener } from "@/components/ui/bidListener";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useViewerCount } from "@/hooks/useViewerCount";

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
};

export default function AuctionPage() {
  const { query } = useRouter();
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
        .select("*")
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

      const { data: userData } = await supabase.auth.getUser();
      setBids((prev) => [
        {
          id: crypto.randomUUID(),
          item_id: itemId,
          bidder_id: userData?.user?.id || "me",
          amount: amt,
          created_at: new Date().toISOString(),
        },
        ...prev,
      ]);

      toast.success(`Your bid of $${amt.toFixed(2)} was submitted!`);
    }
  };

  const handleNewBid = (newBid: Bid) => {
    setBids((prev) => {
      const alreadyExists = prev.some((bid) => bid.id === newBid.id);
      if (alreadyExists) return prev;
      return [newBid, ...prev];
    });
  };

  if (!item) return <div className="p-6">Loading auction...</div>;

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">{item.name}</h1>
      <p className="text-muted-foreground">{item.description}</p>

      <p className="text-sm text-muted-foreground">
        👀 {viewerCount} {viewerCount === 1 ? "person is" : "people are"} viewing this auction
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
              ${bid.amount.toFixed(2)} — {" "}
              {new Date(bid.created_at).toLocaleTimeString([], {
                hour: "numeric",
                minute: "numeric",
                second: "numeric",
              })}
            </li>
          ))}
        </ul>
      </div>

      <BidListener itemId={itemId} onNewBid={handleNewBid} />
    </div>
  );
}

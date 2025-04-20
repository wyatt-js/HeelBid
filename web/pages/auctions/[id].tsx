import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { createSupabaseComponentClient } from "@/utils/supabase/create-browser-client";
import { placeBid } from "@/utils/supabase/placeBid";
import { BidListener } from "@/components/ui/bidListener";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type AuctionItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  end_time: string;
  image_url?: string;
  state: string;
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

  const currentBid = bids[0]?.amount || item?.price || 0;

  const submitBid = async () => {
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= currentBid) {
      alert("Bid must be higher than the current bid.");
      return;
    }

    const { error } = await placeBid(itemId, amt);
    if (error) {
      alert("Failed to place bid: " + error.message);
    } else {
      setAmount("");
    }
  };

  const handleNewBid = (newBid: Bid) => {
    setBids((prev) => [newBid, ...prev]);
    alert(`New Bid Placed: $${newBid.amount.toFixed(2)}`);
  };

  if (!item) return <div className="p-6">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">{item.name}</h1>
      <p className="text-muted-foreground">{item.description}</p>

      <div className="border p-4 rounded bg-background shadow">
        <h2 className="text-lg font-medium mb-2">Current Highest Bid</h2>
        <p className="text-3xl font-bold">${currentBid.toFixed(2)}</p>
      </div>

      <div className="flex gap-3 items-end">
        <Input
          type="number"
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
              ${bid.amount.toFixed(2)} — {new Date(bid.created_at).toLocaleTimeString()}
            </li>
          ))}
        </ul>
      </div>

      <BidListener itemId={itemId} onNewBid={handleNewBid} />
    </div>
  );
}

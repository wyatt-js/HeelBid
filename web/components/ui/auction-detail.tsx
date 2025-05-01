import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { AuctionItem } from "./auction-card";
import { placeBid } from "@/utils/supabase/placeBid";
import { createSupabaseComponentClient } from "@/utils/supabase/create-browser-client";
import { useBidUpdates } from "@/hooks/useBidUpdates";

type Props = {
  auction: AuctionItem & {
    imageUrl: string;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AuctionDetailModal({ auction, open, onOpenChange }: Props) {
  const [bidAmount, setBidAmount] = useState<number | string>("");
  const [status, setStatus] = useState<null | string>(null);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(auction.duration * 60);
  const [highestBid, setHighestBid] = useState<number>(auction.price);
  const [winner, setWinner] = useState<string | null>(null);
  const [hasEnded, setHasEnded] = useState<boolean>(false);

  const supabase = createSupabaseComponentClient();

  useBidUpdates(auction.id, (newBid) => {
    setHighestBid((prev) => (newBid.amount > prev ? newBid.amount : prev));
  });

  const fetchHighestBid = async (updateWinner = false) => {
    type HighestBidResponse = {
      amount: number;
      bidder_id: string;
      profiles: {
        display_name: string;
      } | null;
    };

    const { data, error } = await supabase
      .from("bid")
      .select("amount, bidder_id, profiles(display_name)")
      .eq("item_id", auction.id)
      .order("amount", { ascending: false })
      .limit(1)
      .single<HighestBidResponse>();

    if (!error && data) {
      setHighestBid(data.amount);
      if (updateWinner) {
        setWinner(data.profiles?.display_name || data.bidder_id);
      }
    }
  };

  useEffect(() => {
    if (!open) return;

    fetchHighestBid();

    const start = new Date(auction.start_time).getTime();
    const end = start + auction.duration * 60 * 1000;

    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((end - now) / 1000));
      setTimeLeft(remaining);

      if (remaining === 0) {
        clearInterval(interval);
        setHasEnded(true);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [open]);

  useEffect(() => {
    if (hasEnded) {
      fetchHighestBid(true); 
    }
  }, [hasEnded]);

  const handlePlaceBid = async () => {
    const bid = Number(bidAmount);
    if (!bidAmount || isNaN(bid)) {
      setStatus("Please enter a valid number.");
      return;
    }
    if (bid <= highestBid) {
      setStatus("Bid must be higher than current highest.");
      return;
    }

    setLoading(true);
    const { error } = await placeBid(auction.id, bid);
    if (!error) {
      await fetchHighestBid(); 
    }
    setLoading(false);

    if (error) {
      setStatus(typeof error === "string" ? error : error.message);
    } else {
      setStatus("Bid placed successfully");
      setBidAmount("");
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <Dialog key={auction.id} open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{auction.name}</DialogTitle>
          <DialogDescription>{auction.description}</DialogDescription>
        </DialogHeader>

        <Image
          src={auction.imageUrl}
          alt={auction.name}
          width={400}
          height={250}
          className="object-cover w-full h-auto mb-4"
        />

        <div className="text-sm text-muted-foreground mb-2">
          Current Bid: ${highestBid} | Time Left: {formatTime(timeLeft)}
        </div>

        {timeLeft > 0 ? (
          <div className="space-y-2">
            <Input
              type="number"
              placeholder="Enter your bid amount"
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
            />
            <Button onClick={handlePlaceBid} disabled={loading}>
              {loading ? "Placing Bid..." : "Place Bid"}
            </Button>
            {status && (
              <p
                className={`text-sm ${
                  status.includes("success") ? "text-green-600" : "text-red-500"
                }`}
              >
                {status}
              </p>
            )}
          </div>
        ) : (
          <p className="text-center mt-4 text-green-600">
            Auction ended. {winner ? `Winner: ${winner}` : "No bids placed."}
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}

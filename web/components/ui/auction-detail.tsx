import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import Image from "next/image";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { AuctionItem} from "./auction-card";
import { placeBid } from "@/utils/supabase/placeBid";
type Props = {
  auction: AuctionItem & {imageUrl: string};
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AuctionDetailModal({ auction, open, onOpenChange }: Props) {
  const [bidAmount, setBidAmount] = useState<number | string>("");
  const [status, setStatus] = useState<null | string>(null);
  const [loading, setLoading] = useState(false);

  const handlePlaceBid = async () => {
    if (!bidAmount || isNaN(Number(bidAmount))) {
      setStatus("Please enter a valid number.");
      return;
    }

    setLoading(true);
    const { error } = await placeBid(auction.id, Number(bidAmount));
    setLoading(false);

    if (error) {
      setStatus(typeof error === "string" ? error : error.message);
    } else {
      setStatus("Bid placed successfully!");
      setBidAmount("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
          Price: ${auction.price} | Duration: {auction.duration}:00
        </div>

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
      </DialogContent>
    </Dialog>
  );
}
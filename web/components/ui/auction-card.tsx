import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { createSupabaseComponentClient } from "@/utils/supabase/create-browser-client";
import { useRouter } from "next/router";
import { AuctionDetailModal } from "./auction-detail";
import { useBidUpdates } from "@/hooks/useBidUpdates";

export type AuctionItem = {
  id: string;
  seller_id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  state: string;
  image_url: string;
  start_time: string;
  bidAmount?: number;
  bidTime?: string;
};

export function AuctionCard({
  auction,
  noBid,
}: {
  auction: AuctionItem;
  noBid: boolean;
}) {
  const router = useRouter();
  const supabase = createSupabaseComponentClient();

  const publicUrl = supabase.storage
    .from("auction-images")
    .getPublicUrl("/" + auction.image_url).data.publicUrl;

  const [currentPrice, setCurrentPrice] = useState(auction.price);

  useEffect(() => {
    const fetchHighestBid = async () => {
      const { data } = await supabase
        .from("bid")
        .select("amount")
        .eq("item_id", auction.id)
        .order("amount", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data?.amount && data.amount > auction.price) {
        setCurrentPrice(data.amount);
      }
    };

    fetchHighestBid();
  }, [auction.id, auction.price, supabase]);

  useBidUpdates(auction.id, (newBid) => {
    if (newBid.amount > currentPrice) {
      setCurrentPrice(newBid.amount);
    }
  });

  const [timeLeft, setTimeLeft] = useState(() => {
    const start = new Date(auction.start_time);
    const end = new Date(start.getTime() + auction.duration * 60 * 1000);
    return end.getTime() - new Date().getTime();
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => Math.max(prev - 1000, 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const minutesLeft = Math.floor(timeLeft / 60000);
  const secondsLeft = Math.floor((timeLeft % 60000) / 1000);
  const [open, setOpen] = useState(false);

  return (
    <>
      <Card className="gap-0 cursor-pointer">
        <div onClick={() => setOpen(true)}>
          <CardHeader>
            <CardTitle>{auction.name}</CardTitle>
            <CardDescription>{auction.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <p className="mt-2 font-semibold">${currentPrice}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {minutesLeft}:{secondsLeft.toString().padStart(2, "0")} remaining
              </p>
            </div>
            <div className="flex items-center justify-center">
              <div className="mt-4 w-[300px] h-[200px] overflow-hidden">
                <Image
                  src={publicUrl}
                  alt={auction.name}
                  width={300}
                  height={200}
                  className="w-[300px] h-[200px] object-cover"
                />
              </div>
            </div>
          </CardContent>
        </div>

        <CardContent>
          {!noBid ? (
            <div className="flex justify-center mt-4">
              <Button
                className="w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/auctions/${auction.id}`);
                }}
              >
                Bid Now
              </Button>
            </div>
          ) : (
            auction.bidAmount &&
            auction.bidTime && (
              <p className="text-sm text-muted-foreground mt-2 text-center">
                Your bid: ${auction.bidAmount} on{" "}
                {new Date(auction.bidTime).toLocaleString()}
              </p>
            )
          )}
        </CardContent>
      </Card>

      <AuctionDetailModal
        auction={{ ...auction, imageUrl: publicUrl }}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}

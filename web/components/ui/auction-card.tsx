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
  const [clientTime, setClientTime] = useState<Date | null>(null);
  const [bidder, setBidder] = useState<string | null>(null);

  useEffect(() => {
    const fetchBidder = async () => {
      const { data: highestBidder, error } = await supabase
        .from("bid")
        .select("bidder_id")
        .eq("item_id", auction.id)
        .order("amount", { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error("Error fetching highest bidder:", error);
      } else {
        const { data: bidderData, error: bidderError } = await supabase
          .from("profile")
          .select("username")
          .eq("id", highestBidder.bidder_id)
          .single();

        if (bidderError) {
          console.error("Error fetching bidder data:", bidderError);
        } else {
          setBidder(bidderData.username);
        }
      }
    };

    fetchBidder();
  }, [auction.id, supabase]);

  useBidUpdates(auction.id, async (newBid) => {
    setCurrentPrice((prev) => {
      if (newBid.amount > prev) {
        return newBid.amount;
      }
      return prev;
    });

    const { data: bidderData, error: bidderError } = await supabase
      .from("profile")
      .select("username")
      .eq("id", newBid.bidder_id)
      .single();

    if (!bidderError && bidderData) {
      setBidder(bidderData.username);
    } else {
      console.error("Error fetching new bidder's username:", bidderError);
    }
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setClientTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  let timeRemaining = "";
  if (clientTime) {
    const startTime = new Date(auction.start_time);
    const endTime = new Date(
      startTime.getTime() + auction.duration * 60 * 1000
    );
    const msLeft = endTime.getTime() - clientTime.getTime();
    const minutesLeft = Math.max(Math.floor(msLeft / 60000), 0);
    const secondsLeft = Math.max(Math.floor((msLeft % 60000) / 1000), 0);
    timeRemaining = `${minutesLeft}:${secondsLeft
      .toString()
      .padStart(2, "0")} remaining`;
  }

  return (
    <>
      <Card className="gap-0 cursor-pointer">
        <CardHeader>
          <CardTitle>{auction.name}</CardTitle>
          <CardDescription>{auction.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <p className="mt-2 font-semibold">${currentPrice}</p>
            {auction.state === "future" ? (
              <p className="text-sm text-muted-foreground">
                Starts on {new Date(auction.start_time).toLocaleString()}
              </p>
            ) : auction.state === "completed" ? (
              <p className="mt-2 text-sm text-muted-foreground">
                Won By: {bidder}
              </p>
            ) : (
              clientTime && (
                <p className="mt-2 text-sm text-muted-foreground">
                  {timeRemaining}
                </p>
              )
            )}
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
          ) : auction.bidAmount && auction.bidTime ? (
            <p className="text-sm text-muted-foreground mt-2 text-center">
              Your bid: ${auction.bidAmount} on{" "}
              {new Date(auction.bidTime).toLocaleString()}
            </p>
          ) : null}
        </CardContent>
      </Card>
    </>
  );
}

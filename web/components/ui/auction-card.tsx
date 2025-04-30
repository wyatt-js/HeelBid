import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createSupabaseComponentClient } from "@/utils/supabase/create-browser-client";
import { useRouter } from "next/router";
import { AuctionDetailModal } from "./auction-detail";

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
  const startTime = new Date(auction.start_time);
  const endTime = new Date(startTime.getTime() + auction.duration * 60 * 1000);
  const now = new Date();
  const msLeft = endTime.getTime() - now.getTime();

  const minutesLeft = Math.max(Math.floor(msLeft / 60000), 0);
  const secondsLeft = Math.max(Math.floor((msLeft % 60000) / 1000), 0);

  const supabase = createSupabaseComponentClient();
  const publicUrl = supabase.storage
    .from("auction-images")
    .getPublicUrl("/" + auction.image_url).data.publicUrl;

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
              <p className="mt-2 font-semibold">${auction.price}</p>
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
    <>
      {auction.bidAmount && auction.bidTime && (
        <p className="text-sm text-muted-foreground mt-2 text-center">
          Your bid: ${auction.bidAmount} on{" "}
          {new Date(auction.bidTime).toLocaleString()}
        </p>
      )}
    </>
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

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createSupabaseComponentClient } from "@/utils/supabase/create-browser-client";

type AuctionItem = {
  id: string;
  seller_id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  state: string;
  image_url: string;
};

export function AuctionCard({ auction }: { auction: AuctionItem }) {
  const supabase = createSupabaseComponentClient();
  const publicUrl = supabase.storage
    .from("auction-images")
    .getPublicUrl("/" + auction.image_url).data.publicUrl;

  return (
    <Card key={auction.id}>
      <CardHeader>
        <CardTitle>{auction.name}</CardTitle>
        <CardDescription>{auction.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center">
          <p className="mt-2 font-semibold">${auction.price}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {auction.duration}:00
          </p>
        </div>
        <div className="flex justify-center items-center">
          <Image
            src={publicUrl}
            alt={auction.name}
            width={200}
            height={200}
            className="mt-4"
          />
        </div>
        <Link href={`/auctions/${auction.id}`} className="block mt-4">
          <Button className="w-full">Bid Now</Button>
        </Link>
      </CardContent>
    </Card>
  );
}
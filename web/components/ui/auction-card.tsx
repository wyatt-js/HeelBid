import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { createSupabaseComponentClient } from "@/utils/supabase/create-browser-client";
import { useRouter } from "next/router";

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
  const router = useRouter();
  const supabase = createSupabaseComponentClient();
  const publicUrl = supabase.storage
    .from("auction-images")
    .getPublicUrl("/" + auction.image_url).data.publicUrl;

  return (
    <Card key={auction.id} className="gap-0">
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
        <div className="flex justify-center mt-4">
        <Button
            className="w-full"
            onClick={() => router.push(`/auctions/${auction.id}`)}
          >
            Bid Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
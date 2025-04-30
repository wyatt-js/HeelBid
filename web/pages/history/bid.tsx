import { createSupabaseServerClient } from "@/utils/supabase/create-server-client";
import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/ui/app-sidebar";
import { AuctionCard } from "@/components/ui/auction-card";
import { HeelbidLogo } from "@/components/ui/heelbid-logo";

export default function BidHistory({
  auctions,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <div className="flex min-h-screen">
      <SidebarProvider className="w-1/5">
        <AppSidebar />
      </SidebarProvider>
      <div className="w-full">
        <div className="w-full p-10 pt-4 pb-4 flex justify-between">
          <h1 className="text-3xl pt-7 font-bold">Bid History</h1>
          <HeelbidLogo />
        </div>
        <div className="w-full p-8 pt-0 grid md:grid-cols-3 gap-4">
          {auctions.map((auction) => (
            <AuctionCard key={auction.id} auction={auction} noBid={true} />
          ))}
        </div>
      </div>
    </div>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const supabase = createSupabaseServerClient(context);

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  const { data: bids, error: bidsError } = await supabase
    .from("bid")
    .select("*, auction_item(*)")
    .eq("bidder_id", userData.user.id);

  if (bidsError) {
    console.error("Error fetching bid history:", bidsError.message);
    return {
      props: { auctions: [] },
    };
  }

  const auctions = (bids || []).map((bid) => ({
    ...bid.auction_item,
    bidAmount: bid.amount,
    bidTime: bid.created_at,
  }));
  

  return {
    props: { auctions },
  };
}

import { createSupabaseServerClient } from "@/utils/supabase/create-server-client";
import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/ui/app-sidebar";
import { AuctionCard } from "@/components/ui/auction-card";

export default function BidHistory({
  auctions,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <div className="flex min-h-screen">
      <SidebarProvider className="w-1/5">
        <AppSidebar />
      </SidebarProvider>
      <div className="w-full">
        <div className="w-full p-8">
          <h1 className="text-3xl font-bold mb-2">Bid History</h1>
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

  const { data: auctions, error: auctionsError } = await supabase
    .from("auction_item")
    .select("*, bid!inner(*)")
    .eq("bid.bidder_id", userData.user.id);

  if (auctionsError) {
    console.error("Error fetching auctions:", auctionsError.message);
    return {
      props: { auctions: [] },
    };
  }

  return {
    props: { auctions },
  };
}

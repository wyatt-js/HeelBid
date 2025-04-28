import { createSupabaseServerClient } from "@/utils/supabase/create-server-client";
import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/ui/app-sidebar";
import { AuctionCard } from "@/components/ui/auction-card";
import { HeelbidLogo } from "@/components/ui/heelbid-logo";

export default function SellerHistory({
  auctions,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <div className="flex min-h-screen">
      <SidebarProvider className="w-1/5">
        <AppSidebar />
      </SidebarProvider>
      <div className="w-full">
        <div className="w-full p-10 pt-4 pb-4 flex justify-between">
          <h1 className="text-3xl pt-7 font-bold">Seller History</h1>
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

  const { data: auctions, error: auctionsError } = await supabase
    .from("auction_item")
    .select("*")
    .eq("seller_id", userData.user.id);

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

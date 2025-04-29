import { createSupabaseServerClient } from "@/utils/supabase/create-server-client";
import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/ui/app-sidebar";
import { AuctionCard } from "@/components/ui/auction-card";
import { HeelbidLogo } from "@/components/ui/heelbid-logo";

export default function OngoingAuctions({
  auctions,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <div className="flex min-h-screen">
      <SidebarProvider className="w-1/5">
        <AppSidebar />
      </SidebarProvider>
      <div className="w-full">
        <div className="w-full p-10 pt-4 pb-4 flex justify-between">
          <h1 className="text-3xl pt-7 font-bold">Ongoing Auctions</h1>
          <HeelbidLogo />
        </div>
        <div className="w-full p-8 pt-0 grid md:grid-cols-3 gap-4">
          {auctions.map((auction) => (
            <AuctionCard key={auction.id} auction={auction} noBid={false} />
          ))}
        </div>
      </div>
    </div>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const supabase = createSupabaseServerClient(context);
  const now = new Date();

  // ✅ Step 1: Move FUTURE → ONGOING
  await supabase
    .from("auction_item")
    .update({ state: "ongoing" })
    .lte("start_time", now.toISOString())
    .eq("state", "future");

  // ✅ Step 2: Move ONGOING → COMPLETED if duration expired
  const { data: ongoingAuctions } = await supabase
    .from("auction_item")
    .select("id, start_time, duration")
    .eq("state", "ongoing");

  for (const auction of ongoingAuctions || []) {
    const start = new Date(auction.start_time);
    const durationMs = auction.duration * 60 * 1000;
    const end = new Date(start.getTime() + durationMs);

    if (end <= now) {
      await supabase
        .from("auction_item")
        .update({ state: "completed" })
        .eq("id", auction.id);
    }
  }

  // ✅ Step 3: Auth check
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  // ✅ Step 4: Fetch active Ongoing Auctions
  const { data: auctions, error: auctionsError } = await supabase
    .from("auction_item")
    .select("*")
    .eq("state", "ongoing");

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

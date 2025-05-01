import Head from "next/head";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { createSupabaseServerClient } from "@/utils/supabase/create-server-client";
import { GetServerSidePropsContext } from "next";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/ui/app-sidebar";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push("/auctions/ongoing");
  }, [router]);

  return (
    <>
      <Head>
        <title>Home | HeelBid</title>
        <meta
          name="description"
          content="Welcome to HeelBid — your platform for live auctions. Redirecting to ongoing auctions..."
        />
      </Head>
      <div className="flex justify-center items-center bg-background">
        <SidebarProvider className="w-1/5">
          <AppSidebar />
        </SidebarProvider>
      </div>
    </>
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
  return {
    props: { data: userData },
  };
}

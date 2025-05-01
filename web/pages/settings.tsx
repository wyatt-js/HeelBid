import Head from "next/head";
import { createSupabaseServerClient } from "@/utils/supabase/create-server-client";
import { GetServerSidePropsContext } from "next";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/ui/app-sidebar";
import { Switch } from "@/components/ui/switch";
import { HeelbidLogo } from "@/components/ui/heelbid-logo";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function Settings() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <Head>
        <title>Settings | HeelBid</title>
        <meta
          name="description"
          content="Customize your HeelBid preferences including dark mode settings."
        />
      </Head>

      <div className="flex min-h-screen">
        <SidebarProvider className="w-1/5">
          <AppSidebar />
        </SidebarProvider>
        <div className="w-full">
          <div className="w-full p-10 pt-4 pb-4 flex justify-between">
            <h1 className="text-3xl pt-7 font-bold">Settings</h1>
            <HeelbidLogo />
          </div>
          <div className="w-full p-8 pt-0 flex flex-col gap-4">
            <div className="flex items-center">
              <label htmlFor="dark-mode" className="mr-4">
                Dark Mode
              </label>
              {mounted && (
                <Switch
                  id="dark-mode"
                  checked={resolvedTheme === "dark"}
                  onCheckedChange={(checked) =>
                    setTheme(checked ? "dark" : "light")
                  }
                />
              )}
            </div>
          </div>
        </div>
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

import { createSupabaseServerClient } from "@/utils/supabase/create-server-client";
import { GetServerSidePropsContext } from "next";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/ui/app-sidebar";
import { Switch } from "@/components/ui/switch";
import { HeelbidLogo } from "@/components/ui/heelbid-logo";

export default function Settings() {
  return (
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
            <Switch id="dark-mode" checked={true} disabled={true} />
          </div>
          <div className="flex items-center">
            <label htmlFor="notifications" className="mr-4">
              Notifications
            </label>
            <Switch id="notifications" checked={true} disabled={true} />
          </div>
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
  return {
    props: { data: userData },
  };
}

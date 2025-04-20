import { createSupabaseServerClient } from "@/utils/supabase/create-server-client";
import { GetServerSidePropsContext } from "next";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/ui/app-sidebar";

export default function FutureAuctions() {
  return (
    <div className="flex justify-center items-center bg-background">
      <SidebarProvider className="w-1/5">
        <AppSidebar />
      </SidebarProvider>
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

import { createSupabaseServerClient } from "@/utils/supabase/create-server-client";
import { GetServerSidePropsContext } from "next";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/ui/app-sidebar";
import { CreateForm } from "@/components/ui/create-form";

export default function Create({ id }: { id: string }) {
  return (
    <div className="flex justify-center items-center bg-background">
      <SidebarProvider className="w-1/5">
        <AppSidebar />
      </SidebarProvider>
      <CreateForm id={id} />
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
    props: { id: userData.user.id },
  };
}

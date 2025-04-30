import { createSupabaseServerClient } from "@/utils/supabase/create-server-client";
import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/ui/app-sidebar";
import { HeelbidLogo } from "@/components/ui/heelbid-logo";

export default function Notifications({
  notifications,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <div className="flex min-h-screen">
      <SidebarProvider className="w-1/5">
        <AppSidebar />
      </SidebarProvider>
      <div className="w-full">
        <div className="w-full p-10 pt-4 pb-4 flex justify-between">
          <h1 className="text-3xl pt-7 font-bold">Notifications</h1>
          <HeelbidLogo />
        </div>
        <div className="w-full p-8 pt-0 grid md:grid-cols-3 gap-4">
          {notifications.map((notification) => (
            <div key={notification.id} className="border p-4 rounded">
              <h2 className="text-xl font-bold">{notification.content}</h2>
              <p className="text-sm text-gray-500">
                {new Date(notification.created_at).toLocaleString()}
              </p>
            </div>
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

  const { data: notifications, error: notifError } = await supabase
    .from("notification")
    .select("*")
    .eq("user_id", userData.user.id)
    .order("created_at", { ascending: false });

  if (notifError) {
    console.error("Error fetching notifications:", notifError.message);
    return {
      props: { notifications: [] },
    };
  }

  return {
    props: { notifications },
  };
}

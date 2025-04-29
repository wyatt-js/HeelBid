import { useEffect } from "react";
import { createSupabaseComponentClient } from "@/utils/supabase/create-browser-client";
import { toast } from "sonner";

export function NotificationListener({ userId }: { userId: string }) {
  useEffect(() => {
    const supabase = createSupabaseComponentClient();

    const channel = supabase
      .channel(`notifications-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notification",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newNotif = payload.new as { content: string };
          toast(newNotif.content);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return null;
}

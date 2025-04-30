import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/react";
import { useEffect, useState } from "react";
import { createSupabaseComponentClient } from "@/utils/supabase/create-browser-client";
import { NotificationListener } from "@/components/ui/notificationListener";

export default function App({ Component, pageProps }: AppProps) {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createSupabaseComponentClient();
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data?.user?.id ?? null);
    });
  }, []);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <main>
        {userId && <NotificationListener userId={userId} />}
        <Component {...pageProps} />
        <Toaster richColors position="top-right" />
        <Analytics />
      </main>
    </ThemeProvider>
  );
}

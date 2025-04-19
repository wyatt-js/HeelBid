import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/ui/app-sidebar";
import { useRouter } from "next/router";
import { ThemeProvider } from "@/components/ui/theme-provider";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const excludedRoutes = ["/login", "/signup"];

  return (
    <>
      {excludedRoutes.includes(router.pathname) ? (
        <main>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Component {...pageProps} />
          </ThemeProvider>
        </main>
      ) : (
        <SidebarProvider>
          <AppSidebar />
          <main>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <SidebarTrigger />
              <Component {...pageProps} />
            </ThemeProvider>
          </main>
        </SidebarProvider>
      )}
    </>
  );
}

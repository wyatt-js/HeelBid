import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/ui/app-sidebar";
import { useRouter } from "next/router";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const excludedRoutes = ["/login", "/signup"];

  if (excludedRoutes.includes(router.pathname)) {
    return (
      <html lang="en" suppressHydrationWarning>
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
      </html>
    );
  }
  return (
    <html lang="en" suppressHydrationWarning>
      <SidebarProvider>
        <AppSidebar />
        <main>
          <SidebarTrigger />
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Component {...pageProps} />
          </ThemeProvider>
        </main>
      </SidebarProvider>
    </html>
  );
}

import { useRouter } from "next/router";
import Link from "next/link";
import {
  Settings,
  UserCheck,
  History,
  BellRing,
  Plus,
  BadgeDollarSign,
  ChevronDown,
  ChevronUp,
  User2,
  LogOut,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createSupabaseComponentClient } from "@/utils/supabase/create-browser-client";
import { useEffect } from "react";
import { useState } from "react";
import { MonoLogo } from "@/components/ui/mono-logo";

const itemsBid = [
  {
    title: "Create an Auction",
    url: "/create",
    icon: Plus,
  },
  {
    title: "Notification Board",
    url: "/notifications",
    icon: BellRing,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
];

const itemsHistory = [
  {
    title: "Bid History",
    url: "/history/bid",
    icon: History,
  },
  {
    title: "Seller History",
    url: "/history/seller",
    icon: UserCheck,
  },
];

const itemsAuctions = [
  {
    title: "Ongoing",
    url: "/auctions/ongoing",
  },
  {
    title: "Future",
    url: "/auctions/future",
  },
  {
    title: "Ended",
    url: "/auctions/ended",
  },
];

export function AppSidebar() {
  const router = useRouter();
  const [userName, setUserName] = useState<string | null>(null);
  const supabase = createSupabaseComponentClient();

  useEffect(() => {
    async function getUser() {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Error fetching user:", error);
        return null;
      }
      setUserName(data.user.user_metadata.display_name);
    }
    getUser();
  });

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarHeader>
          <SidebarMenu className="mt-4">
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <Link href={"/"}>
                  <div className="bg-primary w-12 h-12 flex items-center justify-center rounded-xl">
                    <MonoLogo />
                  </div>
                  <div className="hidden md:flex flex-col pt-1 pl-1">
                    <span className="font-bold">HeelBid</span>
                    <span>Hi, {userName}</span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarGroup>
          <SidebarGroupLabel>Bid</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <Collapsible defaultOpen className="group/collapsible">
                <CollapsibleTrigger asChild>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <div className="flex items-center">
                          <BadgeDollarSign />
                          <span>Auctions</span>
                          <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                        </div>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenu>
                    <SidebarMenuSub>
                      {itemsAuctions.map((item) => (
                        <SidebarMenuSubItem key={item.title}>
                          <SidebarMenuSubButton
                            asChild
                            isActive={router.pathname === item.url}
                          >
                            <Link href={item.url}>
                              <span>{item.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </SidebarMenu>
                </CollapsibleContent>
              </Collapsible>

              {itemsBid.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={router.pathname === item.url}
                  >
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>History</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {itemsHistory.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={router.pathname === item.url}
                  >
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  <User2 /> {userName}
                  <ChevronUp className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                align="end"
                className="w-[--radix-popper-anchor-width]"
              >
                <DropdownMenuItem
                  variant="destructive"
                  onClick={async () => {
                    await supabase.auth.signOut();
                    router.push("/");
                  }}
                >
                  <span className="flex items-center gap-2">
                    <LogOut />
                    Sign out
                  </span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

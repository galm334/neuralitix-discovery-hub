import { useLocation } from "react-router-dom";
import { Home, Star, TrendingUp, Plus, Send, MessageSquare, LogIn } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const navigationItems = [
  { title: "Home", url: "/", icon: Home },
  { title: "Popular", url: "/popular", icon: Star },
  { title: "Trending", url: "/trending", icon: TrendingUp },
  { title: "Just Added", url: "/new", icon: Plus },
  { title: "Submit", url: "/submit", icon: Send },
  { title: "Contact", url: "/contact", icon: MessageSquare },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup className="mt-14 md:mt-8">
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a 
                      href={item.url} 
                      className={`flex items-center gap-3 ${location.pathname === item.url ? 'text-primary' : ''}`}
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
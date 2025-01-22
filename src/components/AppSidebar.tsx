import { Home, Star, TrendingUp, Plus, Send, MessageSquare, Menu } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { SidebarMenuItem } from "./SidebarMenuItem";
import { useSidebar } from "@/contexts/SidebarContext";
import { Button } from "./ui/button";

const navigationItems = [
  { title: "Home", url: "/", icon: Home },
  { title: "Popular", url: "/popular", icon: Star },
  { title: "Trending", url: "/trending", icon: TrendingUp },
  { title: "Just Added", url: "/new", icon: Plus },
  { title: "Submit", url: "/submit", icon: Send },
  { title: "Contact", url: "/contact", icon: MessageSquare },
];

export function AppSidebar() {
  const { isMobile, setOpenMobile } = useSidebar();

  return (
    <>
      {/* Logo header for mobile */}
      {isMobile && (
        <div className="fixed top-0 left-0 right-0 h-14 bg-background border-b border-border flex items-center justify-between z-50 px-4">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setOpenMobile(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-primary absolute left-1/2 -translate-x-1/2">
            Neuralitix
          </h1>
        </div>
      )}
      
      <Sidebar>
        {/* Logo for desktop */}
        {!isMobile && (
          <h1 className="px-4 py-4 text-4xl font-bold text-primary">Neuralitix</h1>
        )}
        <ul className="space-y-2 px-2">
          {navigationItems.map((item) => (
            <SidebarMenuItem
              key={item.title}
              title={item.title}
              url={item.url}
              icon={item.icon}
            />
          ))}
        </ul>
      </Sidebar>
    </>
  );
}
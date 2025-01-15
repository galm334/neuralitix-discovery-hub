import { Home, Star, TrendingUp, Plus, Send, MessageSquare } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { SidebarMenuItem } from "./SidebarMenuItem";
import { useIsMobile } from "@/hooks/use-mobile";

const navigationItems = [
  { title: "Home", url: "/", icon: Home },
  { title: "Popular", url: "/popular", icon: Star },
  { title: "Trending", url: "/trending", icon: TrendingUp },
  { title: "Just Added", url: "/new", icon: Plus },
  { title: "Submit", url: "/submit", icon: Send },
  { title: "Contact", url: "/contact", icon: MessageSquare },
];

export function AppSidebar() {
  const isMobile = useIsMobile();

  return (
    <Sidebar>
      <div className={`${isMobile ? 'flex justify-center' : ''} px-4 py-4`}>
        <div className="flex items-center gap-3">
          <img 
            src="/lovable-uploads/11d612dd-c7d5-4688-bf88-915265d5219b.png" 
            alt="Neuralitix Logo" 
            className="w-8 h-8"
          />
          <span className="font-bold text-3xl text-primary">Neuralitix</span>
        </div>
      </div>
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
  );
}
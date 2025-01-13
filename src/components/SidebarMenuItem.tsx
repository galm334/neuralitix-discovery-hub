import { useLocation } from "react-router-dom";
import { LucideIcon } from "lucide-react";
import {
  SidebarMenuItem as BaseSidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

interface SidebarMenuItemProps {
  icon: LucideIcon;
  title: string;
  url: string;
}

export function SidebarMenuItem({ icon: Icon, title, url }: SidebarMenuItemProps) {
  const location = useLocation();
  const isActive = location.pathname === url;

  return (
    <BaseSidebarMenuItem>
      <SidebarMenuButton asChild>
        <a 
          href={url} 
          className={`flex items-center gap-3 rounded-md px-3 py-2 ${
            isActive 
              ? 'bg-primary/10' 
              : 'hover:bg-primary/5'
          }`}
        >
          <Icon className="h-5 w-5" />
          <span>{title}</span>
        </a>
      </SidebarMenuButton>
    </BaseSidebarMenuItem>
  );
}
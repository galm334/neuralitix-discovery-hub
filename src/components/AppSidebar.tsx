import { Home, Search, Zap, Star, Sparkles, Mail, Plus } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const categories = [
  { title: "No-Code App & Website Builders", url: "/category/no-code" },
  { title: "Text-to-Image & Design Tools", url: "/category/text-to-image" },
  { title: "Writing, Editing & Content Creation", url: "/category/writing" },
  { title: "Voice, Audio & Text-to-Speech Tools", url: "/category/voice" },
  { title: "Video Editing & Generation", url: "/category/video" },
  { title: "Chatbots & Virtual Assistants", url: "/category/chatbots" },
  { title: "Data Analysis & Business Intelligence", url: "/category/data-analysis" },
  { title: "Document Management & Summarization", url: "/category/document" },
  { title: "Marketing, Growth & SEO Optimization", url: "/category/marketing" },
  { title: "Finance, Trading & Investing", url: "/category/finance" },
  { title: "Ecommerce & Sales Automation", url: "/category/ecommerce" },
];

const navigationItems = [
  { title: "Home", url: "/", icon: Home },
  { title: "Search", url: "/search", icon: Search },
  { title: "Trending", url: "/trending", icon: Zap },
  { title: "Most Popular", url: "/popular", icon: Star },
  { title: "Just Added", url: "/new", icon: Sparkles },
];

const actionItems = [
  { title: "Submit a Tool", url: "/submit", icon: Plus },
  { title: "Contact Us", url: "/contact", icon: Mail },
];

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Categories</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {categories.map((category) => (
                <SidebarMenuItem key={category.title}>
                  <SidebarMenuButton asChild>
                    <a href={category.url}>{category.title}</a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {actionItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
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
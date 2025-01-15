import { Home, Star, TrendingUp, Plus, Send, MessageSquare, LogIn } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { SidebarMenuItem } from "./SidebarMenuItem";
import { useSidebar } from "@/contexts/SidebarContext";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";

const navigationItems = [
  { title: "Home", url: "/", icon: Home },
  { title: "Popular", url: "/popular", icon: Star },
  { title: "Trending", url: "/trending", icon: TrendingUp },
  { title: "Just Added", url: "/new", icon: Plus },
  { title: "Submit", url: "/submit", icon: Send },
  { title: "Contact", url: "/contact", icon: MessageSquare },
];

export function AppSidebar() {
  const { isMobile } = useSidebar();
  const navigate = useNavigate();

  const handleAuthClick = () => {
    navigate('/auth');
  };

  return (
    <>
      {/* Logo header for mobile */}
      {isMobile && (
        <div className="fixed top-0 left-0 right-0 h-14 bg-background border-b border-border flex items-center justify-between z-50 px-4">
          <h1 className="text-2xl font-bold text-primary">Neuralitix</h1>
          <Button variant="ghost" size="sm" onClick={handleAuthClick}>
            <LogIn className="h-4 w-4 mr-2" />
            Sign In
          </Button>
        </div>
      )}
      
      <Sidebar>
        {/* Logo and auth button for desktop */}
        {!isMobile && (
          <div className="px-4 py-4 flex items-center justify-between">
            <h1 className="text-4xl font-bold text-primary">Neuralitix</h1>
            <Button variant="ghost" size="sm" onClick={handleAuthClick}>
              <LogIn className="h-4 w-4 mr-2" />
              Sign In
            </Button>
          </div>
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
          {/* Auth button in mobile menu */}
          {isMobile && (
            <li className="mt-4">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={handleAuthClick}
              >
                <LogIn className="h-4 w-4 mr-2" />
                Sign In
              </Button>
            </li>
          )}
        </ul>
      </Sidebar>
    </>
  );
}
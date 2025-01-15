import { Home, Star, TrendingUp, Plus, Send, MessageSquare } from "lucide-react";
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

  const handleAuthClick = (type: 'signin' | 'signup') => {
    navigate(`/auth?type=${type}`);
  };

  const AuthButtons = () => (
    <div className="flex gap-2">
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => handleAuthClick('signin')}
        className="text-white hover:text-white hover:bg-primary/80"
      >
        Sign in
      </Button>
      <Button 
        size="sm" 
        onClick={() => handleAuthClick('signup')}
        className="bg-blue-500 text-white hover:bg-blue-600"
      >
        Sign up
      </Button>
    </div>
  );

  return (
    <>
      {/* Logo header for mobile */}
      {isMobile && (
        <div className="fixed top-0 left-0 right-0 h-14 bg-background border-b border-border flex items-center justify-between z-50 px-4">
          <h1 className="text-2xl font-bold text-primary">Neuralitix</h1>
          <AuthButtons />
        </div>
      )}
      
      <Sidebar>
        {/* Logo and auth buttons for desktop */}
        {!isMobile && (
          <>
            <h1 className="px-4 py-4 text-4xl font-bold text-primary">Neuralitix</h1>
            <div className="fixed top-4 right-8 z-50">
              <AuthButtons />
            </div>
          </>
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
          {/* Auth buttons in mobile menu */}
          {isMobile && (
            <li className="mt-4 flex flex-col gap-2">
              <Button 
                variant="ghost" 
                className="w-full justify-start text-white hover:text-white hover:bg-primary/80"
                onClick={() => handleAuthClick('signin')}
              >
                Sign in
              </Button>
              <Button 
                className="w-full justify-start bg-blue-500 text-white hover:bg-blue-600"
                onClick={() => handleAuthClick('signup')}
              >
                Sign up
              </Button>
            </li>
          )}
        </ul>
      </Sidebar>
    </>
  );
}
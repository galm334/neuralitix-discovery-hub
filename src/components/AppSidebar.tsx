import { Home, Star, TrendingUp, Plus, Send, MessageSquare, Menu, Mail, LucideIcon, UserPlus, LogIn } from "lucide-react";
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

interface AuthOptionProps {
  title: string;
  icon?: LucideIcon;
  onClick: () => void;
}

export function AppSidebar() {
  const { isMobile, openMobile, setOpenMobile } = useSidebar();
  const navigate = useNavigate();

  const handleAuthClick = (type: 'signin' | 'signup') => {
    navigate(`/auth?type=${type}`);
    setOpenMobile(false);
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

  const AuthOption = ({ title, icon: Icon, onClick }: AuthOptionProps) => (
    <button
      onClick={onClick}
      className="flex items-center gap-3 w-full px-4 py-3 text-sm text-foreground/70 hover:bg-accent/50 hover:text-foreground rounded-md"
    >
      {Icon && <Icon className="h-5 w-5" />}
      <span>{title}</span>
    </button>
  );

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
          {/* Auth options in mobile menu */}
          {isMobile && (
            <li className="mt-4 space-y-2">
              <AuthOption
                title="Sign up"
                icon={UserPlus}
                onClick={() => handleAuthClick('signup')}
              />
              <AuthOption
                title="Sign in with Email"
                icon={Mail}
                onClick={() => handleAuthClick('signin')}
              />
              <AuthOption
                title="Sign in with Google"
                icon={LogIn}
                onClick={() => handleAuthClick('signin')}
              />
            </li>
          )}
        </ul>
      </Sidebar>
    </>
  );
}
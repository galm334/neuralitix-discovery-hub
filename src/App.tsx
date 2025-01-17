import { Toaster } from "@/components/ui/sonner";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { AppSidebar } from "@/components/AppSidebar";
import { AppRoutes } from "@/components/routing/AppRoutes";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthPage = location.pathname === '/auth' || location.pathname === '/onboarding';
  const isLegalPage = ['/terms', '/privacy', '/gdpr'].includes(location.pathname);

  useEffect(() => {
    // Handle hash parameters for magic link authentication
    const handleAuthRedirect = async () => {
      if (location.hash && location.hash.includes('access_token')) {
        const hashParams = new URLSearchParams(location.hash.replace('#', ''));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        if (accessToken && refreshToken) {
          try {
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken
            });

            if (error) throw error;

            if (data.session) {
              console.log("Successfully set session from magic link");
              toast.success("Successfully signed in!");
              navigate("/onboarding", { replace: true });
            }
          } catch (error) {
            console.error("Error setting session:", error);
            toast.error("Failed to authenticate. Please try again.");
            navigate("/auth", { replace: true });
          }
        }
      }
    };

    handleAuthRedirect();
  }, [location.hash, navigate]);

  return (
    <AuthProvider>
      <SidebarProvider>
        <div className="flex min-h-screen bg-background">
          {!isAuthPage && !isLegalPage && <AppSidebar />}
          <main className="flex-1">
            <AppRoutes />
          </main>
          <Toaster />
          <ChatWidget />
        </div>
      </SidebarProvider>
    </AuthProvider>
  );
}

export default App;
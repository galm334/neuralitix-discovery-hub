import { Toaster } from "@/components/ui/sonner";
import { BrowserRouter } from "react-router-dom";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { AppSidebar } from "@/components/AppSidebar";
import { AppRoutes } from "@/components/routing/AppRoutes";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { useLocation } from "react-router-dom";

function App() {
  const location = useLocation();
  const isAuthPage = location.pathname === '/auth' || location.pathname === '/onboarding';
  const isLegalPage = ['/terms', '/privacy', '/gdpr'].includes(location.pathname);

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
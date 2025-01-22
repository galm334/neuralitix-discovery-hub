import { Toaster } from "@/components/ui/sonner";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { AppSidebar } from "@/components/AppSidebar";
import { AppRoutes } from "@/components/routing/AppRoutes";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { useLocation } from "react-router-dom";

function App() {
  const location = useLocation();
  const isLegalPage = ['/terms', '/privacy', '/gdpr'].includes(location.pathname);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background">
        {!isLegalPage && <AppSidebar />}
        <main className="flex-1">
          <AppRoutes />
        </main>
        <Toaster />
        <ChatWidget />
      </div>
    </SidebarProvider>
  );
}

export default App;
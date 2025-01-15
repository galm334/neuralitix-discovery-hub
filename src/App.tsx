import { Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { BrowserRouter } from "react-router-dom";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppSidebar } from "@/components/AppSidebar";
import Index from "@/pages/Index";
import Popular from "@/pages/Popular";
import Trending from "@/pages/Trending";
import JustAdded from "@/pages/JustAdded";
import ToolPage from "@/pages/ToolPage";
import CategoryPage from "@/pages/CategoryPage";
import Chat from "@/pages/Chat";
import StandaloneChat from "@/pages/StandaloneChat";
import Auth from "@/pages/Auth";
import Onboarding from "@/pages/Onboarding";
import Terms from "@/pages/Terms";
import Privacy from "@/pages/Privacy";
import GDPR from "@/pages/GDPR";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

function App() {
  const location = useLocation();
  const isStandaloneChat = location.pathname === '/standalone-chat';
  const isAuthPage = location.pathname === '/auth' || location.pathname === '/onboarding';
  const isLegalPage = ['/terms', '/privacy', '/gdpr'].includes(location.pathname);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'OPEN_CHATBOT') {
        const chatbotEmbed = document.querySelector('#chatbot-embed');
        if (chatbotEmbed) {
          try {
            const clickEvent = new MouseEvent('click', {
              bubbles: true,
              cancelable: true,
              view: window
            });
            chatbotEmbed.dispatchEvent(clickEvent);
          } catch (error) {
            console.error('Error opening chatbot:', error);
          }
        }
      }
    };

    const style = document.createElement('style');
    style.textContent = `
      .zi-embed-chat,
      .zi-embed-chat *,
      .zi-embed-chat div,
      .zi-embed-chat iframe {
        max-width: 100px !important;
        width: 100px !important;
      }
      .zi-embed-chat-popup-wrapper,
      .zi-embed-chat-popup-wrapper *,
      .zi-embed-chat-popup-wrapper div,
      .zi-embed-chat-popup-wrapper iframe {
        max-width: 100px !important;
        width: 100px !important;
      }
    `;
    document.head.appendChild(style);

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
      document.head.removeChild(style);
    };
  }, []);

  return (
    <AuthProvider>
      <SidebarProvider>
        <div className="flex min-h-screen bg-background">
          {!isAuthPage && !isLegalPage && <AppSidebar />}
          <main className="flex-1">
            <Routes>
              {/* Public routes */}
              <Route path="/auth" element={<Auth />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/gdpr" element={<GDPR />} />
              <Route path="/standalone-chat" element={<StandaloneChat />} />
              <Route path="/" element={<Index />} />
              <Route path="/popular" element={<Popular />} />
              <Route path="/trending" element={<Trending />} />
              <Route path="/just-added" element={<JustAdded />} />
              <Route path="/tool/:toolId" element={<ToolPage />} />
              <Route path="/category/:category" element={<CategoryPage />} />

              {/* Protected routes - only for features requiring authentication */}
              <Route path="/chat/:conversationId" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
            </Routes>
          </main>
          <Toaster />
          {!isStandaloneChat && !isAuthPage && !isLegalPage && (
            <div 
              className="fixed bottom-0 right-0 z-50" 
              style={{ 
                width: '100px',
                maxWidth: '100px',
                overflow: 'hidden'
              }}
            >
              <zapier-interfaces-chatbot-embed 
                id="chatbot-embed"
                is-popup='true' 
                chatbot-id='clqec2l2r00ca28qsdfz0m4my'
                style={{ 
                  width: '100px',
                  maxWidth: '100px'
                }}
              />
            </div>
          )}
        </div>
      </SidebarProvider>
    </AuthProvider>
  );
}

export default App;
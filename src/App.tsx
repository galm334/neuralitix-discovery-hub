import { Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { BrowserRouter } from "react-router-dom";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { AppSidebar } from "@/components/AppSidebar";
import Index from "@/pages/Index";
import Popular from "@/pages/Popular";
import Trending from "@/pages/Trending";
import JustAdded from "@/pages/JustAdded";
import ToolPage from "@/pages/ToolPage";
import CategoryPage from "@/pages/CategoryPage";
import Chat from "@/pages/Chat";
import StandaloneChat from "@/pages/StandaloneChat";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

function App() {
  const location = useLocation();
  const isStandaloneChat = location.pathname === '/standalone-chat';

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

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background">
        <AppSidebar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/popular" element={<Popular />} />
            <Route path="/trending" element={<Trending />} />
            <Route path="/just-added" element={<JustAdded />} />
            <Route path="/tool/:toolId" element={<ToolPage />} />
            <Route path="/category/:category" element={<CategoryPage />} />
            <Route path="/chat/:conversationId" element={<Chat />} />
            <Route path="/standalone-chat" element={<StandaloneChat />} />
          </Routes>
        </main>
        <Toaster />
        {!isStandaloneChat && (
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
                width: '100%',
                maxWidth: '100%'
              }}
            />
          </div>
        )}
      </div>
    </SidebarProvider>
  );
}

export default App;
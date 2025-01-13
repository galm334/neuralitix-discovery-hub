import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { AppSidebar } from "@/components/AppSidebar";
import { Sparkles, Menu, X } from "lucide-react";
import { useSidebar } from "@/contexts/SidebarContext";
import Index from "./pages/Index";
import Popular from "./pages/Popular";
import Trending from "./pages/Trending";
import JustAdded from "./pages/JustAdded";
import ToolPage from "./pages/ToolPage";

const queryClient = new QueryClient();

function Header() {
  const { openMobile, setOpenMobile, toggleSidebar } = useSidebar();
  
  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-background border-b border-border z-50 flex items-center px-4">
      <button 
        onClick={toggleSidebar}
        className="md:hidden text-foreground hover:text-primary transition-colors bg-background"
      >
        {openMobile ? (
          <X className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </button>
      <div className="flex items-center gap-2 md:flex-none flex-1 justify-center md:justify-start">
        <Sparkles className="h-6 w-6 text-primary" />
        <span className="text-xl font-bold text-primary">Neuralitix</span>
      </div>
      <div className="hidden md:block ml-auto">
        <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium">
          Login / Sign Up
        </button>
      </div>
    </header>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <div className="dark">
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SidebarProvider>
            <Header />
            <div className="min-h-screen flex w-full pt-14 bg-background text-foreground">
              <AppSidebar />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/popular" element={<Popular />} />
                  <Route path="/trending" element={<Trending />} />
                  <Route path="/just-added" element={<JustAdded />} />
                  <Route path="/tool/:id" element={<ToolPage />} />
                </Routes>
              </main>
            </div>
          </SidebarProvider>
        </BrowserRouter>
      </div>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
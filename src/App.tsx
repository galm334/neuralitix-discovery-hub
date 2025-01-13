import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Sparkles, LogIn } from "lucide-react";
import Index from "./pages/Index";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <div className="dark">
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <header className="fixed top-0 left-0 right-0 h-14 bg-background border-b border-border z-50 flex items-center px-4">
            <SidebarTrigger className="md:hidden" />
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
          <SidebarProvider>
            <div className="min-h-screen flex w-full pt-14 bg-background text-foreground">
              <AppSidebar />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<Index />} />
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
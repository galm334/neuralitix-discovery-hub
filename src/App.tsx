import { AppSidebar } from "./components/AppSidebar";
import { AppRoutes } from "./components/routing/AppRoutes";
import { SidebarProvider } from "./contexts/SidebarContext";
import { Footer } from "./components/Footer";
import { Toaster } from "sonner";

function App() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col">
        <div className="flex-1 flex">
          <AppSidebar />
          <main className="flex-1 md:ml-44 pt-14 md:pt-0">
            <AppRoutes />
          </main>
        </div>
        <Footer />
        <Toaster />
      </div>
    </SidebarProvider>
  );
}

export default App;
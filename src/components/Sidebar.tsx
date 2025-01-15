import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useSidebar } from "@/contexts/SidebarContext";

export function Sidebar({ children }: { children: React.ReactNode }) {
  const { isMobile, openMobile, setOpenMobile, isOpen } = useSidebar();

  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile}>
        <SheetContent 
          side="left" 
          className="w-[280px] p-0 bg-background border-r border-border"
        >
          <nav className="h-full flex flex-col bg-background">
            {children}
          </nav>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div className={`${isOpen ? 'w-44' : 'w-0'} transition-all duration-300 hidden md:block`}>
      <nav className={`fixed top-0 left-0 h-full w-44 bg-background border-r border-border pt-14`}>
        {children}
      </nav>
    </div>
  );
}
import { useState } from "react";
import { useParams } from "react-router-dom";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { CategoryToolList } from "@/components/category/CategoryToolList";
import { CategorySidebar } from "@/components/category/CategorySidebar";
import { Home, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";

export default function CategoryPage() {
  const { category } = useParams();
  const [selectedFilters, setSelectedFilters] = useState({
    features: [],
    platform: [],
    pricing: [],
  });
  const [sortBy, setSortBy] = useState("rating");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const isMobile = useIsMobile();

  const categoryName = category?.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

  return (
    <div className="container py-8">
      {!isMobile && (
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">
                <Home className="h-4 w-4" />
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/categories">Categories</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{categoryName}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      )}

      <div className="mt-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Best {categoryName} Tools in 2025</h1>
        {!isMobile && (
          <p className="text-muted-foreground mb-8">
            Discover the top-rated {categoryName?.toLowerCase()} tools that are revolutionizing the industry.
            Updated in real-time based on user feedback and performance metrics.
          </p>
        )}
      </div>

      {isMobile && (
        <div className="flex gap-2 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search tools..." 
              className="pl-9"
            />
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px]">
              <CategorySidebar 
                onFilterChange={setSelectedFilters} 
                onSortChange={setSortBy}
              />
            </SheetContent>
          </Sheet>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          <CategoryToolList category={category} filters={selectedFilters} sortBy={sortBy} />
        </div>
        {!isMobile && (
          <div className="lg:col-span-1">
            <CategorySidebar 
              onFilterChange={setSelectedFilters} 
              onSortChange={setSortBy}
            />
          </div>
        )}
      </div>
    </div>
  );
}
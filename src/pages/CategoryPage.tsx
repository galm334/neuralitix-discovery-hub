import { useState } from "react";
import { useParams } from "react-router-dom";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { CategoryToolList } from "@/components/category/CategoryToolList";
import { CategorySidebar } from "@/components/category/CategorySidebar";
import { Home } from "lucide-react";

export default function CategoryPage() {
  const { category } = useParams();
  const [selectedFilters, setSelectedFilters] = useState({
    features: [],
    platform: [],
    pricing: [],
  });
  const [sortBy, setSortBy] = useState("rating");

  const categoryName = category?.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  const currentYear = new Date().getFullYear() + 1;

  return (
    <div className="container py-8">
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

      <div className="mt-8">
        <h1 className="text-4xl font-bold mb-4">Best {categoryName} Tools in {currentYear}</h1>
        <p className="text-muted-foreground mb-8">
          Discover the top-rated {categoryName?.toLowerCase()} tools that are revolutionizing the industry.
          Updated in real-time based on user feedback and performance metrics.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          <CategoryToolList category={category} filters={selectedFilters} sortBy={sortBy} />
        </div>
        <div className="lg:col-span-1">
          <CategorySidebar 
            onFilterChange={setSelectedFilters} 
            onSortChange={setSortBy}
          />
        </div>
      </div>
    </div>
  );
}
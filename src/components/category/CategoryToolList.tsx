import { useState, useEffect, useRef } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileToolCard } from "./MobileToolCard";
import { DesktopToolCard } from "./DesktopToolCard";
import { CategoryInsights } from "./CategoryInsights";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CategoryToolListProps {
  category?: string;
  filters: {
    features: string[];
    platform: string[];
    pricing: string[];
  };
  sortBy?: string;
}

interface Tool {
  title: string;
  description: string;
  image: string;
  price: string;
  rating: number;
  saves: number;
  isVerified: boolean;
}

const TOOLS_PER_PAGE = 25;

export function CategoryToolList({ category, filters, sortBy = "rating" }: CategoryToolListProps) {
  const isMobile = useIsMobile();
  const [currentPage, setCurrentPage] = useState(1);
  const [isSwipingUp, setIsSwipingUp] = useState(false);
  const [isSwipingDown, setIsSwipingDown] = useState(false);
  const touchStartY = useRef(0);

  // Simulated tools array (replace with your actual data)
  const tools = Array(100).fill(null).map((_, index) => ({
    title: `Tool ${index + 1}`,
    description: "Advanced AI-powered tool that helps users achieve better results faster.",
    image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b",
    price: index % 2 === 0 ? "Free" : "$10/month",
    rating: Number((9.8 - (index * 0.1)).toFixed(1)), // Format to one decimal place
    saves: 1234 - index,
    isVerified: index < 10,
  }));

  const sortedTools = [...tools].sort((a, b) => {
    switch (sortBy) {
      case "rating":
        return b.rating - a.rating;
      case "saves":
        return b.saves - a.saves;
      case "newest":
        return 0;
      default:
        return 0;
    }
  });

  const totalPages = Math.ceil(sortedTools.length / TOOLS_PER_PAGE);
  const startIndex = (currentPage - 1) * TOOLS_PER_PAGE;
  const currentTools = sortedTools.slice(startIndex, startIndex + TOOLS_PER_PAGE);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touchY = e.touches[0].clientY;
    const diff = touchStartY.current - touchY;

    if (diff > 50 && currentPage < totalPages) {
      setIsSwipingDown(true);
    } else if (diff < -50 && currentPage > 1) {
      setIsSwipingUp(true);
    }
  };

  const handleTouchEnd = () => {
    if (isSwipingDown) {
      setCurrentPage(prev => Math.min(prev + 1, totalPages));
    } else if (isSwipingUp) {
      setCurrentPage(prev => Math.max(prev - 1, 1));
    }
    setIsSwipingDown(false);
    setIsSwipingUp(false);
  };

  return (
    <div 
      className="space-y-8"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="space-y-5">
        {currentTools.map((tool, index) => (
          isMobile ? (
            <MobileToolCard key={tool.title} tool={tool} index={startIndex + index} />
          ) : (
            <DesktopToolCard key={tool.title} tool={tool} index={startIndex + index} />
          )
        ))}
      </div>

      {!isMobile ? (
        <>
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    onClick={() => setCurrentPage(page)}
                    className="w-10 h-10 p-0"
                  >
                    {page}
                  </Button>
                ))}
              </div>

              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}
          <CategoryInsights category={category || ""} />
        </>
      ) : (
        <div className="text-center text-white mt-4">
          {isSwipingDown ? "Release to load more" : "Swipe down to load more"}
        </div>
      )}
    </div>
  );
}
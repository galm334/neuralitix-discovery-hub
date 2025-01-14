import { AIToolCard } from "@/components/AIToolCard";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Users, Search } from "lucide-react";

interface CategoryToolListProps {
  category?: string;
  filters: {
    features: string[];
    platform: string[];
    pricing: string[];
  };
  sortBy?: string;
}

// Mock data - replace with real data from your backend
const tools = [
  {
    title: "CodeReviewer AI",
    description: "Advanced AI-powered code review tool that helps developers write better code faster. Features include real-time suggestions, security scanning, and performance optimization tips.",
    image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6",
    price: "Free",
    rating: 9.8,
    saves: 1234,
    isVerified: true,
  },
  {
    title: "DataViz Assistant",
    description: "Intelligent data visualization platform that automatically generates beautiful charts and insights. Supports multiple data sources and real-time collaboration.",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71",
    price: "$10/month",
    rating: 9.5,
    saves: 892,
    isVerified: true,
  },
];

const categoryInsights = {
  monthlySearches: "50K+",
  activeUsers: "100K+",
  growthRate: "+25%",
};

export function CategoryToolList({ category, filters, sortBy = "rating" }: CategoryToolListProps) {
  // Sort tools based on the selected criteria
  const sortedTools = [...tools].sort((a, b) => {
    switch (sortBy) {
      case "rating":
        return b.rating - a.rating;
      case "saves":
        return b.saves - a.saves;
      case "newest":
        return 0; // In real implementation, compare dates
      default:
        return 0;
    }
  });

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Monthly Searches</p>
              <p className="text-xl font-bold">{categoryInsights.monthlySearches}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center space-x-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Active Users</p>
              <p className="text-xl font-bold">{categoryInsights.activeUsers}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Monthly Growth</p>
              <p className="text-xl font-bold">{categoryInsights.growthRate}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        {sortedTools.map((tool, index) => (
          <div key={tool.title} className="relative">
            <div className="absolute -left-8 top-4 font-bold text-2xl text-muted-foreground">
              #{index + 1}
            </div>
            <AIToolCard {...tool} />
          </div>
        ))}
      </div>

      <div className="mt-12 prose prose-invert max-w-none">
        <h2>Category Insights</h2>
        <p>
          This category has shown significant growth over the past year, with a steady increase in both user adoption and feature innovation. 
          Tools in this space are increasingly focusing on AI-powered automation and seamless integration capabilities.
        </p>
        <h3>Market Trends</h3>
        <ul>
          <li>Growing demand for AI-powered automation features</li>
          <li>Increased focus on team collaboration capabilities</li>
          <li>Rising interest in cross-platform compatibility</li>
        </ul>
      </div>
    </div>
  );
}
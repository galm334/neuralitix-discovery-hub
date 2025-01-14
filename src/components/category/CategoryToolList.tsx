import { AIToolCard } from "@/components/AIToolCard";

interface CategoryToolListProps {
  category?: string;
  filters: {
    features: string[];
    platform: string[];
    pricing: string[];
  };
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

export function CategoryToolList({ category, filters }: CategoryToolListProps) {
  return (
    <div className="space-y-6">
      {tools.map((tool, index) => (
        <div key={tool.title} className="relative">
          <div className="absolute -left-8 top-4 font-bold text-2xl text-muted-foreground">
            #{index + 1}
          </div>
          <AIToolCard {...tool} />
        </div>
      ))}
    </div>
  );
}
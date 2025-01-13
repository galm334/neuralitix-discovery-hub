import { AIToolCard } from "@/components/AIToolCard";
import { Button } from "@/components/ui/button";

const categories = ["Writing", "Development", "Data", "Image", "Research", "Video"];

const trendingTools = [
  {
    title: "WriterGPT Pro",
    description: "Advanced AI writing assistant powered by GPT-4 for content creation, editing, and style enhancement.",
    image: "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7",
    price: "Free",
    rating: 9.5,
    saves: 1234,
    isVerified: true,
  },
  // ... Add more tools as needed
];

export default function Trending() {
  return (
    <div className="container py-8">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold mb-6">Trending AI Agents</h1>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant="outline"
                className="hover:bg-primary hover:text-primary-foreground"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trendingTools.map((tool) => (
            <AIToolCard key={tool.title} {...tool} />
          ))}
        </div>
      </div>
    </div>
  );
}
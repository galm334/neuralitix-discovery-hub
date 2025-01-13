import { AIToolCard } from "@/components/AIToolCard";

const newTools = [
  {
    title: "ResearchMind AI",
    description: "Accelerate your research with AI-powered literature review and analysis.",
    image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d",
    price: "$20/month",
    rating: 9.3,
    saves: 456,
    isVerified: true,
  },
  {
    title: "VideoGen AI",
    description: "Create professional videos with AI-powered editing and effects.",
    image: "https://images.unsplash.com/photo-1535016120720-40c646be5580",
    price: "$25/month",
    rating: 9.4,
    saves: 789,
    isVerified: true,
  },
  // ... Add more tools as needed
];

export default function JustAdded() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Just Added</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {newTools.map((tool) => (
          <AIToolCard key={tool.title} {...tool} />
        ))}
      </div>
    </div>
  );
}
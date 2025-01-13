import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

interface Review {
  source: string;
  rating: number;
  comment: string;
}

interface ToolReviewsProps {
  reviews: Review[];
}

export function ToolReviews({ reviews }: ToolReviewsProps) {
  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div key={review.source} className="border border-border rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold">{review.source}</h3>
            <Badge variant="secondary" className="bg-accent/50">
              {review.rating}/10
            </Badge>
          </div>
          <p className="text-muted-foreground">{review.comment}</p>
        </div>
      ))}
      <Button variant="outline" className="w-full">
        Read more reviews
        <ExternalLink className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
}
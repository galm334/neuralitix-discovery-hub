import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ExternalLink } from "lucide-react";

interface AIToolCardProps {
  title: string;
  description: string;
  image: string;
  price: string;
  rating: number;
  saves: number;
  isVerified?: boolean;
}

export function AIToolCard({
  title,
  description,
  image,
  price,
  rating,
  saves,
  isVerified = false,
}: AIToolCardProps) {
  return (
    <Card className="overflow-hidden bg-card hover:shadow-lg transition-shadow">
      <div className="relative h-48">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 left-2">
          {isVerified && (
            <Badge variant="secondary" className="bg-blue-500/10 text-blue-500">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Verified
            </Badge>
          )}
        </div>
        <div className="absolute top-2 right-2">
          <Badge variant="secondary" className="bg-slate-950 text-white">
            {price}
          </Badge>
        </div>
      </div>
      <CardContent className="p-4">
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex flex-col gap-4">
        <Button className="w-full" variant="default">
          Try now
          <ExternalLink className="w-4 h-4 ml-2" />
        </Button>
        <div className="flex justify-between items-center text-sm text-muted-foreground border-t pt-4">
          <span className="font-medium">{rating}/10</span>
          <span>{saves.toLocaleString()} saves</span>
        </div>
      </CardFooter>
    </Card>
  );
}
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bookmark, CheckCircle2, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

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
  // Convert title to URL-friendly slug
  const slug = title.toLowerCase().replace(/\s+/g, '-');
  
  return (
    <Card className="overflow-hidden border-2 border-[#9b87f5]/20 hover:shadow-lg transition-shadow">
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
        <Link to={`/tool/${slug}`} className="hover:text-primary transition-colors">
          <h3 className="text-xl font-semibold mb-2">{title}</h3>
        </Link>
        <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex flex-col gap-2">
        <Button className="w-full bg-[#6366F1] hover:bg-[#6366F1]/90" variant="default">
          Try now
          <ExternalLink className="w-4 h-4 ml-2" />
        </Button>
        <div className="w-full flex justify-end items-center text-sm text-muted-foreground border-t border-[#9b87f5]/20 pt-1">
          <div className="flex items-center gap-1">
            <Bookmark className="w-4 h-4" />
            <span>{saves.toLocaleString()}</span>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
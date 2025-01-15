import { Link } from "react-router-dom";
import { Link2 } from "lucide-react";
import { Card } from "@/components/ui/card";

interface SearchResultCardProps {
  id: string;
  name: string;
  description: string;
  logo_url: string | null;
}

const SearchResultCard = ({ id, name, description, logo_url }: SearchResultCardProps) => {
  return (
    <Card key={id} className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex gap-4">
        <div className="w-16 h-16 flex-shrink-0">
          {logo_url ? (
            <img
              src={logo_url}
              alt={`${name} logo`}
              className="w-full h-full object-contain rounded-lg"
            />
          ) : (
            <div className="w-full h-full bg-muted rounded-lg flex items-center justify-center">
              <Link2 className="w-6 h-6 text-muted-foreground" />
            </div>
          )}
        </div>
        <div className="flex-1">
          <Link 
            to={`/tool/${name.toLowerCase().replace(/\s+/g, '-')}`}
            className="text-xl font-semibold hover:text-primary transition-colors"
          >
            {name}
          </Link>
          <p className="text-muted-foreground mt-2">
            {description}
            <Link 
              to={`/tool/${name.toLowerCase().replace(/\s+/g, '-')}`}
              className="ml-2 text-primary hover:underline inline-flex items-center"
            >
              See more
            </Link>
          </p>
        </div>
      </div>
    </Card>
  );
};

export default SearchResultCard;
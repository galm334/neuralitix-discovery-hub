import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Discover the Best AI Tools
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Explore and compare top-rated AI tools across different categories
          </p>
          
          <div className="relative max-w-2xl mx-auto">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input 
                  type="text"
                  placeholder="Search AI tools..."
                  className="w-full pl-10 h-12 text-lg"
                />
              </div>
              <Button className="h-12 px-6 text-lg">
                Search
              </Button>
            </div>
          </div>

          <div className="mt-12 grid grid-cols-2 md:grid-cols-3 gap-4">
            {["No-Code", "Text-to-Image", "Writing"].map((category) => (
              <a
                key={category}
                href={`/category/${category.toLowerCase()}`}
                className="p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <h3 className="font-medium text-gray-900">{category}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Top 50 {category} Tools
                </p>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
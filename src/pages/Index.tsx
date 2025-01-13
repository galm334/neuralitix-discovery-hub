import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent">
            Compare and Find the Best GenAI Tools for You
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            #1 AI agent aggregator. Updated daily. Used by 1M+ humans
          </p>
          
          <div className="relative max-w-2xl mx-auto">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input 
                  type="text"
                  placeholder="Find me an agent that..."
                  className="w-full pl-10 h-12 text-lg bg-background/50 backdrop-blur-sm"
                />
              </div>
              <Button className="h-12 px-6 text-lg">
                Search
              </Button>
            </div>
          </div>

          <div className="mt-20 grid grid-cols-4 gap-8 text-center">
            <div>
              <h3 className="text-4xl font-bold text-primary mb-2">1,000+</h3>
              <p className="text-muted-foreground">AI Agents</p>
            </div>
            <div>
              <h3 className="text-4xl font-bold text-primary mb-2">50K+</h3>
              <p className="text-muted-foreground">Daily Users</p>
            </div>
            <div>
              <h3 className="text-4xl font-bold text-primary mb-2">24/7</h3>
              <p className="text-muted-foreground">Updates</p>
            </div>
            <div>
              <h3 className="text-4xl font-bold text-primary mb-2">100%</h3>
              <p className="text-muted-foreground">Free</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
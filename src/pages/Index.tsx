import { SearchBar } from "@/components/search/SearchBar";
import { Stats } from "@/components/stats/Stats";

const Index = () => {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-background">
      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent text-left">
            Neuralitix
          </h1>
          <p className="text-xl text-muted-foreground mb-8 hidden md:block">
            #1 AI agent aggregator. Updated daily. Used by 1M+ humans
          </p>
          
          <SearchBar />
          <Stats />
        </div>
      </div>
    </div>
  );
}

export default Index;
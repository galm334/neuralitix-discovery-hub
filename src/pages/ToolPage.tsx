import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bookmark, CheckCircle2, ExternalLink, Share2, Send, Plus, X } from "lucide-react";

interface Review {
  source: string;
  rating: number;
  comment: string;
}

interface Update {
  title: string;
  date: string;
  description: string;
}

const reviews: Review[] = [
  {
    source: "TechCrunch",
    rating: 9.0,
    comment: "A game-changing AI tool that delivers exceptional results.",
  },
  {
    source: "Product Hunt",
    rating: 9.5,
    comment: "One of the most impressive AI tools we've seen this year.",
  },
  {
    source: "The Verge",
    rating: 8.5,
    comment: "Sets a new standard for AI-powered tools.",
  },
];

const updates: Update[] = [
  {
    title: "Major Performance Improvements",
    date: "27/02/2024",
    description: "We've significantly improved response times and added support for more complex queries.",
  },
  {
    title: "New Features Released",
    date: "20/02/2024",
    description: "Introducing custom templates and advanced export options.",
  },
  {
    title: "API Updates",
    date: "15/02/2024",
    description: "Enhanced API capabilities with new endpoints and improved documentation.",
  },
];

const ToolPage = () => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative px-4 py-8 md:px-6 lg:px-8">
        <Button 
          variant="outline" 
          size="icon"
          className="absolute left-4 top-4 md:left-6 md:top-6"
        >
          <Share2 className="h-4 w-4" />
        </Button>

        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col space-y-6">
            {/* Header Row */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-2">
                  <img 
                    src="/placeholder.svg"
                    alt="Tool Logo"
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div>
                    <Badge className="mb-2 bg-blue-500/10 text-blue-500">Development</Badge>
                    <h1 className="text-3xl font-bold">CodeReviewer AI</h1>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 mb-4">
                  <img 
                    src="https://ui.shadcn.com/avatars/01.png" 
                    alt="Din Watts"
                    className="w-6 h-6 rounded-full"
                  />
                  <span className="text-sm">Din Watts</span>
                  <span className="text-sm text-muted-foreground">• 1,234 agents</span>
                </div>
              </div>

              <Button size="lg" className="shrink-0">
                Visit Agent
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-semibold">9.5</span>
                  <span className="text-sm text-muted-foreground">/10</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Bookmark className="h-4 w-4" />
                  <span>892 saves</span>
                </div>
              </div>

              <div className="flex gap-4">
                <Button variant="outline">
                  Save
                  <Bookmark className="ml-2 h-4 w-4" />
                </Button>
                <Button variant="outline">
                  Share
                  <Send className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Tabs Section */}
          <Tabs defaultValue="overview" className="mt-8">
            <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
              {["Overview", "Updates", "Reviews", "Pros & Cons", "FAQ", "Pricing"].map((tab) => (
                <TabsTrigger
                  key={tab}
                  value={tab.toLowerCase().replace(/ & /g, "-")}
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2"
                >
                  {tab}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              {/* Featured Image */}
              <div className="w-full aspect-[21/9] mb-8 rounded-lg overflow-hidden">
                <img 
                  src="/placeholder.svg"
                  alt="CodeReviewer AI Featured"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="prose prose-invert max-w-none">
                <h2>What sets CodeReviewer AI apart</h2>
                <p>
                  CodeReviewer AI is a cutting-edge AI agent that revolutionizes how we approach tasks. 
                  Built with the latest advancements in artificial intelligence and machine learning, 
                  it offers an intuitive and powerful solution for professionals and enthusiasts alike.
                </p>
                <p>
                  What sets CodeReviewer AI apart is its ability to understand context and deliver precise, 
                  relevant results. The agent employs sophisticated algorithms to analyze user input and 
                  generate high-quality output that meets specific requirements and industry standards.
                </p>
                <div className="mt-8">
                  <h3>Tags</h3>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {["Writing", "AI", "Machine Learning", "Automation", "Productivity"].map((tag) => (
                      <Badge key={tag} variant="secondary" className="bg-accent/50">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="updates" className="mt-6">
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-semibold">Updates</h2>
                  <Button variant="outline">
                    Add Update
                    <Plus className="ml-2 h-4 w-4" />
                  </Button>
                </div>
                {updates.map((update) => (
                  <div key={update.title} className="border border-border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold">{update.title}</h3>
                      <span className="text-sm text-muted-foreground">{update.date}</span>
                    </div>
                    <p className="text-muted-foreground">{update.description}</p>
                  </div>
                ))}
                <Button variant="outline" className="w-full">
                  Read more updates
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="mt-6">
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
            </TabsContent>

            <TabsContent value="pros-cons" className="mt-6">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h2 className="text-2xl font-semibold mb-4 text-green-500">Pros</h2>
                  <ul className="space-y-3">
                    {[
                      "Advanced AI models for better results",
                      "Intuitive user interface",
                      "Real-time processing",
                      "Extensive customization options",
                      "Regular updates and improvements"
                    ].map((pro) => (
                      <li key={pro} className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                        <span>{pro}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h2 className="text-2xl font-semibold mb-4 text-red-500">Cons</h2>
                  <ul className="space-y-3">
                    {[
                      "Learning curve for advanced features",
                      "Requires stable internet connection",
                      "Limited offline capabilities",
                      "Some features require Pro plan"
                    ].map((con) => (
                      <li key={con} className="flex items-start gap-2">
                        <X className="h-5 w-5 text-red-500 mt-0.5" />
                        <span>{con}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="faq" className="mt-6">
              <div className="space-y-6">
                <div className="border border-border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">What is WriterGPT Pro?</h3>
                  <p className="text-muted-foreground">
                    WriterGPT Pro is an advanced AI writing assistant powered by GPT-4, designed to help with content creation, editing, and style enhancement.
                  </p>
                </div>
                <div className="border border-border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">How does the pricing work?</h3>
                  <p className="text-muted-foreground">
                    We offer flexible pricing plans including a free tier for basic usage, a Pro plan for advanced features, and Enterprise plans for custom solutions.
                  </p>
                </div>
                <div className="border border-border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Can I use it offline?</h3>
                  <p className="text-muted-foreground">
                    While some basic features work offline, most features require an internet connection to access our AI models and cloud services.
                  </p>
                </div>
                <div className="border border-border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Do you offer refunds?</h3>
                  <p className="text-muted-foreground">
                    Yes, we offer a 30-day money-back guarantee if you're not satisfied with our service.
                  </p>
                </div>
                <div className="border border-border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">What about data privacy?</h3>
                  <p className="text-muted-foreground">
                    We take data privacy seriously. All data is encrypted and we never share your information with third parties.
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="pricing" className="mt-6">
              <div className="grid md:grid-cols-3 gap-8">
                {/* Free Plan */}
                <div className="border border-border rounded-lg p-6">
                  <h3 className="text-xl font-semibold mb-2">Free</h3>
                  <div className="mb-4">
                    <span className="text-3xl font-bold">$0</span>
                    <span className="text-muted-foreground">/per month</span>
                  </div>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>Basic AI capabilities</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>Standard response time</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>Community support</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>Basic analytics</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>100 requests per day</span>
                    </li>
                  </ul>
                  <Button className="w-full" variant="outline">
                    Get Started
                  </Button>
                </div>

                {/* Pro Plan */}
                <div className="border-2 border-primary rounded-lg p-6 relative">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Pro</h3>
                  <div className="mb-4">
                    <span className="text-3xl font-bold">$29</span>
                    <span className="text-muted-foreground">/per month</span>
                  </div>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>Advanced AI models</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>Priority response time</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>Email support</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>Advanced analytics</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>Unlimited requests</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>API access</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>Custom integrations</span>
                    </li>
                  </ul>
                  <Button className="w-full">
                    Get Started
                  </Button>
                </div>

                {/* Enterprise Plan */}
                <div className="border border-border rounded-lg p-6">
                  <h3 className="text-xl font-semibold mb-2">Enterprise</h3>
                  <div className="mb-4">
                    <span className="text-3xl font-bold">Custom</span>
                    <span className="text-muted-foreground">/per month</span>
                  </div>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>Custom AI models</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>Dedicated support</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>SLA guarantee</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>Advanced security</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>Custom features</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>Training sessions</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>Dedicated account manager</span>
                    </li>
                  </ul>
                  <Button className="w-full" variant="outline">
                    Contact Sales
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ToolPage;

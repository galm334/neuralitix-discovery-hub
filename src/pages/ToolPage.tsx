import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ToolHeader } from "@/components/tool/ToolHeader";
import { ToolUpdates } from "@/components/tool/ToolUpdates";
import { ToolReviews } from "@/components/tool/ToolReviews";
import { ToolProsAndCons } from "@/components/tool/ToolProsAndCons";
import { ToolFAQ } from "@/components/tool/ToolFAQ";
import { ToolPricing } from "@/components/tool/ToolPricing";

const reviews = [
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

const updates = [
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

const pros = [
  "Advanced AI models for better results",
  "Intuitive user interface",
  "Real-time processing",
  "Extensive customization options",
  "Regular updates and improvements"
];

const cons = [
  "Learning curve for advanced features",
  "Requires stable internet connection",
  "Limited offline capabilities",
  "Some features require Pro plan"
];

const faqs = [
  {
    question: "What is WriterGPT Pro?",
    answer: "WriterGPT Pro is an advanced AI writing assistant powered by GPT-4, designed to help with content creation, editing, and style enhancement."
  },
  {
    question: "How does the pricing work?",
    answer: "We offer flexible pricing plans including a free tier for basic usage, a Pro plan for advanced features, and Enterprise plans for custom solutions."
  },
  {
    question: "Can I use it offline?",
    answer: "While some basic features work offline, most features require an internet connection to access our AI models and cloud services."
  },
  {
    question: "Do you offer refunds?",
    answer: "Yes, we offer a 30-day money-back guarantee if you're not satisfied with our service."
  },
  {
    question: "What about data privacy?",
    answer: "We take data privacy seriously. All data is encrypted and we never share your information with third parties."
  }
];

const pricingTiers = [
  {
    name: "Free",
    price: "$0",
    features: [
      "Basic AI capabilities",
      "Standard response time",
      "Community support",
      "Basic analytics",
      "100 requests per day"
    ]
  },
  {
    name: "Pro",
    price: "$29",
    isPopular: true,
    features: [
      "Advanced AI models",
      "Priority response time",
      "Email support",
      "Advanced analytics",
      "Unlimited requests",
      "API access",
      "Custom integrations"
    ]
  },
  {
    name: "Enterprise",
    price: "Custom",
    features: [
      "Custom AI models",
      "Dedicated support",
      "SLA guarantee",
      "Advanced security",
      "Custom features",
      "Training sessions",
      "Dedicated account manager"
    ]
  }
];

const ToolPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="relative px-4 py-8 md:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <ToolHeader
            title="CodeReviewer AI"
            logoUrl="/placeholder.svg"
            category="Research"
            dateAdded="11th of June, 2024"
            authorName="Din Watts"
            authorAgentsCount={1234}
            authorImageUrl="https://ui.shadcn.com/avatars/01.png"
            description="Accelerate your research with AI-powered literature review and analysis."
            rating={9.5}
            saves={892}
          />

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
              <ToolUpdates updates={updates} />
            </TabsContent>

            <TabsContent value="reviews" className="mt-6">
              <ToolReviews reviews={reviews} />
            </TabsContent>

            <TabsContent value="pros-cons" className="mt-6">
              <ToolProsAndCons pros={pros} cons={cons} />
            </TabsContent>

            <TabsContent value="faq" className="mt-6">
              <ToolFAQ faqs={faqs} />
            </TabsContent>

            <TabsContent value="pricing" className="mt-6">
              <ToolPricing pricingTiers={pricingTiers} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ToolPage;
import { useState } from "react";
import { ToolHeader } from "@/components/tool/ToolHeader";
import { ToolPageMobileView } from "@/components/tool/ToolPageMobileView";
import { ToolPageDesktopView } from "@/components/tool/ToolPageDesktopView";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="relative px-4 py-8 md:px-6 lg:px-8 max-w-[100vw] overflow-x-hidden">
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

          {isMobile ? (
            <ToolPageMobileView
              updates={updates}
              reviews={reviews}
              pros={pros}
              cons={cons}
              faqs={faqs}
              pricingTiers={pricingTiers}
              scrollToSection={scrollToSection}
            />
          ) : (
            <ToolPageDesktopView
              updates={updates}
              reviews={reviews}
              pros={pros}
              cons={cons}
              faqs={faqs}
              pricingTiers={pricingTiers}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ToolPage;
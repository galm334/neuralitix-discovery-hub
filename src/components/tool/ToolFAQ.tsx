interface FAQItem {
  question: string;
  answer: string;
}

interface ToolFAQProps {
  faqs: FAQItem[];
}

export function ToolFAQ({ faqs }: ToolFAQProps) {
  return (
    <div className="space-y-6">
      {faqs.map((faq) => (
        <div key={faq.question} className="border border-border rounded-lg p-4">
          <h3 className="font-semibold mb-2">{faq.question}</h3>
          <p className="text-muted-foreground">{faq.answer}</p>
        </div>
      ))}
    </div>
  );
}
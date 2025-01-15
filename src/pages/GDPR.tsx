import { ScrollArea } from "@/components/ui/scroll-area";

const GDPR = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">GDPR Information Notice</h1>
      <ScrollArea className="h-[600px] rounded-md border p-6">
        <div className="space-y-4">
          <section>
            <p>Updated on 23 November 2024</p>
            <p>Neuralitix, located at Neuralitix.com, acts as a Personal Data Controller, committed to protecting your privacy in accordance with the General Data Protection Regulation (GDPR) (EU) 2016/679 and applicable local data protection laws. This notice outlines how we collect, use, and protect personal data through our website and associated services.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold mb-2">What Personal Data We Collect</h2>
            <p>We may collect and process the following types of personal data:</p>
            <ul className="list-disc pl-6">
              <li>Identity Data: Name, email address, and other identifiers.</li>
              <li>Contact Data: Address, email address, and telephone numbers.</li>
              <li>Technical Data: IP address, browser type, and version.</li>
              <li>Usage Data: Information about how you use our website and services.</li>
            </ul>
          </section>
          <section>
            <h2 className="text-xl font-semibold mb-2">How We Use Your Personal Data</h2>
            <p>We use your personal data for the following purposes:</p>
            <ul className="list-disc pl-6">
              <li>To provide and manage our services.</li>
              <li>To communicate with you about your account or transactions.</li>
              <li>To send you marketing communications.</li>
              <li>To comply with legal obligations.</li>
            </ul>
          </section>
          <section>
            <h2 className="text-xl font-semibold mb-2">Your Rights Under GDPR</h2>
            <p>You have the following rights under GDPR:</p>
            <ul className="list-disc pl-6">
              <li>The right to access your personal data.</li>
              <li>The right to rectification of inaccurate personal data.</li>
              <li>The right to erasure of your personal data.</li>
              <li>The right to restrict processing of your personal data.</li>
              <li>The right to data portability.</li>
              <li>The right to object to processing of your personal data.</li>
            </ul>
          </section>
          <section>
            <h2 className="text-xl font-semibold mb-2">Contact Us</h2>
            <p>If you have any questions about this GDPR Information Notice or our privacy practices, please contact us at:</p>
            <p>Email: hi@neuralitix.com</p>
            <p>Address: Neuralitix, 123 AI Lane, Tech City, TC 12345</p>
          </section>
        </div>
      </ScrollArea>
    </div>
  );
};

export default GDPR;
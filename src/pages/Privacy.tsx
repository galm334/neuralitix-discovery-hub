import { ScrollArea } from "@/components/ui/scroll-area";

const Privacy = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <ScrollArea className="h-[600px] rounded-md border p-6">
        <div className="space-y-4">
          <section>
            <h2 className="text-xl font-semibold mb-2">Introduction</h2>
            <p>Updated on 23 November 2024</p>
            <p>This Privacy Policy outlines how Neuralitix (hereafter referred to as "we" or "us") collects, uses, and protects your personal data when you interact with our services. We are committed to safeguarding your privacy and ensuring that your personal data is protected. Please read this policy carefully to understand our practices regarding your personal data. If you have any questions, feel free to contact us using the details provided at the end of this document.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold mb-2">Information We Collect</h2>
            <p>We may collect and process the following types of personal data about you:</p>
            <ul className="list-disc pl-6">
              <li>Contact information (e.g., name, email address)</li>
              <li>Account information (e.g., username, password)</li>
              <li>Usage data (e.g., how you use our services)</li>
              <li>Marketing data (e.g., your preferences for receiving marketing from us)</li>
            </ul>
          </section>
          <section>
            <h2 className="text-xl font-semibold mb-2">How We Use Your Information</h2>
            <p>We use your personal data for the following purposes:</p>
            <ul className="list-disc pl-6">
              <li>To provide and maintain our services</li>
              <li>To notify you about changes to our services</li>
              <li>To allow you to participate in interactive features of our services when you choose to do so</li>
              <li>To provide customer support</li>
              <li>To gather analysis or valuable information so that we can improve our services</li>
              <li>To monitor the usage of our services</li>
              <li>To detect, prevent, and address technical issues</li>
              <li>To fulfill any other purpose for which you provide it</li>
            </ul>
          </section>
          <section>
            <h2 className="text-xl font-semibold mb-2">Data Security</h2>
            <p>We take the security of your personal data seriously and implement appropriate technical and organizational measures to protect it from unauthorized access, use, or disclosure. However, please be aware that no method of transmission over the internet or method of electronic storage is 100% secure, and we cannot guarantee its absolute security.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold mb-2">Your Rights</h2>
            <p>You have the right to request access to the personal data we hold about you, to request correction of any inaccuracies, and to request deletion of your personal data under certain circumstances. If you wish to exercise any of these rights, please contact us using the details provided at the end of this document.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold mb-2">Changes to This Privacy Policy</h2>
            <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold mb-2">Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact us:</p>
            <ul className="list-disc pl-6">
              <li>Email: support@neuralitix.com</li>
              <li>Website: www.neuralitix.com</li>
            </ul>
          </section>
        </div>
      </ScrollArea>
    </div>
  );
};

export default Privacy;

import { ScrollArea } from "@/components/ui/scroll-area";

const GDPR = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">GDPR Information Notice for Neuralitix</h1>
      <ScrollArea className="h-[600px] rounded-md border p-6">
        <div className="space-y-4">
          <section>
            <p>Updated on 23 November 2024</p>
            <p>Neuralitix, located at Neuralitix.com, acts as a Personal Data Controller, committed to protecting your privacy in accordance with the General Data Protection Regulation (GDPR) (EU) 2016/679 and applicable local data protection laws. This notice outlines how we collect, use, and protect personal data through our website and associated services.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold mb-2">Scope of the Notice</h2>
            <p>This GDPR Information Notice applies exclusively to personal data collected through our website, [Neuralitix.com], and our social media accounts. Please note that any external websites linked to our site are not covered by this notice.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold mb-2">Data Collection and Usage</h2>
            <p>We collect and process personal data to effectively manage our services and enhance user experience. The types of data we may collect include:</p>
            <ul className="list-disc pl-6">
              <li>Full name</li>
              <li>Contact details (such as email address or phone number)</li>
              <li>User identification and password for account registration</li>
              <li>Information collected through cookies (refer to our Cookie Policy for details)</li>
            </ul>
            <p>Providing personal data is generally voluntary unless required by law. However, certain services may not be accessible without providing the necessary information.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold mb-2">Purpose of Data Processing</h2>
            <p>The personal data collected is used for:</p>
            <ul className="list-disc pl-6">
              <li>Managing and improving our services</li>
              <li>Customizing user experiences</li>
              <li>Communicating with users, including updates, responses to inquiries, and promotional content</li>
              <li>Conducting market and satisfaction surveys</li>
            </ul>
            <p>Data is processed for specific purposes and will not be used for other purposes without your consent.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold mb-2">Data Retention</h2>
            <p>We retain personal data only for as long as necessary to fulfill the purposes for which it was collected, or as required by law. Data processed solely for legal obligations may be retained longer, subject to appropriate safeguards.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold mb-2">Data Sharing and Transfers</h2>
            <p>We may share personal data with third parties with your consent or to provide certain services. We ensure that any third parties receiving data provide adequate safeguards for data protection. We may also disclose data as required by law or to protect our rights and users' safety.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold mb-2">Your Rights</h2>
            <p>You have the right to access, update, rectify, or delete your personal data. You can exercise these rights by accessing your account settings or contacting us at [hi@Neuralitix.com].</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold mb-2">Data Protection Officer (DPO)</h2>
            <p>For questions or concerns regarding your data, please contact our Data Protection Officer at [DPO Contact Information].</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold mb-2">Children's Privacy</h2>
            <p>Neuralitix does not knowingly collect personal data from children under 18. Our services are intended for adults, and any data processing involving minors requires consent from a legal guardian.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold mb-2">Updates to This Notice</h2>
            <p>We may update this GDPR Information Notice periodically. We encourage you to review this notice regularly to stay informed about how we handle your personal data. Continued use of our services constitutes acceptance of the current notice.</p>
          </section>
          <section>
            <p>For further inquiries, please contact us at [hi@Neuralitix.com].</p>
          </section>
        </div>
      </ScrollArea>
    </div>
  );
};

export default GDPR;
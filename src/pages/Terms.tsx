import { ScrollArea } from "@/components/ui/scroll-area";

const Terms = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Terms and Conditions</h1>
      <ScrollArea className="h-[600px] rounded-md border p-6">
        <div className="space-y-4">
          <section>
            <h2 className="text-xl font-semibold mb-2">INTRODUCTION AND ACCEPTANCE OF TERMS</h2>
            <p>Updated on 16 November 2024</p>
            <p>Welcome to Neuralitix (the "Site"), a platform designed to connect users with real estate agents and related services. These Terms of Use (the "Terms") govern your access to and use of the Site and its services. By accessing or using the Site, you agree to be bound by these Terms, including any additional terms and policies referenced herein or available by hyperlink. If you do not agree to these Terms, you must not access or use the Site.</p>
            <p>Neuralitix is committed to providing a seamless, user-friendly experience to help users find the best real estate professionals.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold mb-2">USER ACCOUNTS</h2>
            <p>To access certain features of the Site, you may be required to create an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete. You are responsible for safeguarding your password and for any activities or actions under your account.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold mb-2">USE OF THE SITE</h2>
            <p>You agree to use the Site only for lawful purposes and in accordance with these Terms. You agree not to use the Site:</p>
            <ul className="list-disc pl-6">
              <li>In any way that violates any applicable federal, state, local, or international law or regulation.</li>
              <li>For the purpose of exploiting, harming, or attempting to exploit or harm minors in any way by exposing them to inappropriate content or otherwise.</li>
              <li>To transmit, or procure the sending of, any advertising or promotional material, including any "junk mail," "chain letter," "spam," or any other similar solicitation.</li>
            </ul>
          </section>
          <section>
            <h2 className="text-xl font-semibold mb-2">INTELLECTUAL PROPERTY RIGHTS</h2>
            <p>The Site and its entire contents, features, and functionality (including but not limited to all information, software, text, displays, images, video, and audio, and the design, selection, and arrangement thereof) are owned by Neuralitix, its licensors, or other providers of such material and are protected by United States and international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold mb-2">CHANGES TO THE TERMS</h2>
            <p>We may revise these Terms from time to time. All changes are effective immediately when we post them and apply to all access to and use of the Site thereafter. Your continued use of the Site following the posting of revised Terms means that you accept and agree to the changes.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold mb-2">GOVERNING LAW</h2>
            <p>These Terms and any dispute or claim arising out of, or related to, them or their subject matter or formation (including non-contractual disputes or claims) shall be governed by and construed in accordance with the law of the State of [Your State], without giving effect to any choice or conflict of law provision or rule (whether of the State of [Your State] or any other jurisdiction).</p>
          </section>
        </div>
      </ScrollArea>
    </div>
  );
};

export default Terms;
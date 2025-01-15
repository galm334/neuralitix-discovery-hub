import { useEffect } from "react";

const StandaloneChat = () => {
  useEffect(() => {
    // Load Zapier script dynamically
    const script = document.createElement('script');
    script.src = 'https://interfaces.zapier.com/assets/web-components/zapier-interfaces/zapier-interfaces.esm.js';
    script.type = 'module';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-semibold mb-6">Chat with AI Assistant</h1>
      <div className="mx-auto max-w-[400px]">
        <zapier-interfaces-chatbot-embed
          is-popup="false"
          chatbot-id="clqec2l2r00ca28qsdfz0m4my"
          height="600px"
          width="400px"
        />
      </div>
    </div>
  );
};

export default StandaloneChat;
import { useEffect } from "react";

const StandaloneChat = () => {
  useEffect(() => {
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
    <div className="w-full flex justify-center">
      <div className="w-full max-w-3xl px-4 py-8">
        <zapier-interfaces-chatbot-embed
          is-popup="false"
          chatbot-id="clqec2l2r00ca28qsdfz0m4my"
          height="600px"
          width="100%"
        />
      </div>
    </div>
  );
};

export default StandaloneChat;
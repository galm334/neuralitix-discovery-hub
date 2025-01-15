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
    <div className="pl-4 py-8">
      <div>
        <zapier-interfaces-chatbot-embed
          is-popup="false"
          chatbot-id="clqec2l2r00ca28qsdfz0m4my"
          height="600px"
          width="400px"
          className="md:w-[800px]"
        />
      </div>
    </div>
  );
};

export default StandaloneChat;
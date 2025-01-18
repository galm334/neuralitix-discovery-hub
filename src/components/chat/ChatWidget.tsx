import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function ChatWidget() {
  const location = useLocation();
  const isStandaloneChat = location.pathname === '/standalone-chat';
  const isAuthPage = location.pathname === '/auth' || location.pathname === '/onboarding';
  const isLegalPage = ['/terms', '/privacy', '/gdpr'].includes(location.pathname);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'OPEN_CHATBOT') {
        const chatbotEmbed = document.querySelector('#chatbot-embed');
        if (chatbotEmbed) {
          try {
            const clickEvent = new MouseEvent('click', {
              bubbles: true,
              cancelable: true,
              view: window
            });
            chatbotEmbed.dispatchEvent(clickEvent);
          } catch (error) {
            console.error('Error opening chatbot:', error);
          }
        }
      }
    };

    const style = document.createElement('style');
    style.textContent = `
      .zi-embed-chat,
      .zi-embed-chat *,
      .zi-embed-chat div,
      .zi-embed-chat iframe {
        max-width: 100px !important;
        width: 100px !important;
      }
      .zi-embed-chat-popup-wrapper,
      .zi-embed-chat-popup-wrapper *,
      .zi-embed-chat-popup-wrapper div,
      .zi-embed-chat-popup-wrapper iframe {
        max-width: 100px !important;
        width: 100px !important;
      }
    `;
    document.head.appendChild(style);

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
      document.head.removeChild(style);
    };
  }, []);

  if (isStandaloneChat || isAuthPage || isLegalPage) {
    return null;
  }

  return (
    <div 
      className="fixed bottom-0 right-0 z-50" 
      style={{ 
        width: '100px',
        maxWidth: '100px',
        overflow: 'hidden'
      }}
    >
      <zapier-interfaces-chatbot-embed 
        id="chatbot-embed"
        is-popup='true' 
        chatbot-id='clqec2l2r00ca28qsdfz0m4my'
        style={{ 
          width: '100px',
          maxWidth: '100px'
        }}
      />
    </div>
  );
}
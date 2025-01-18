import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { logger } from '@/utils/logger';

export function ChatWidget() {
  const location = useLocation();
  const isStandaloneChat = location.pathname === '/standalone-chat';
  const isAuthPage = location.pathname === '/auth' || location.pathname === '/onboarding';
  const isLegalPage = ['/terms', '/privacy', '/gdpr'].includes(location.pathname);

  useEffect(() => {
    const allowedOrigins = [
      'https://neuralitix.com',
      'https://www.neuralitix.com',
      'http://localhost:3000',
      'https://gptengineer.app',
      'https://lovable.dev'
    ];

    const handleMessage = (event: MessageEvent) => {
      // Validate origin
      if (!allowedOrigins.includes(event.origin)) {
        logger.error('Blocked message from untrusted origin:', event.origin);
        return;
      }

      logger.info('Received message from origin:', event.origin);

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
            logger.info('Successfully triggered chatbot open');
          } catch (error) {
            logger.error('Error opening chatbot:', error);
          }
        }
      }
    };

    // Increase message channel timeout
    const style = document.createElement('style');
    style.textContent = `
      .zi-embed-chat,
      .zi-embed-chat *,
      .zi-embed-chat div,
      .zi-embed-chat iframe {
        max-width: 100px !important;
        width: 100px !important;
        transition: all 0.5s ease-in-out !important;
      }
      .zi-embed-chat-popup-wrapper,
      .zi-embed-chat-popup-wrapper *,
      .zi-embed-chat-popup-wrapper div,
      .zi-embed-chat-popup-wrapper iframe {
        max-width: 100px !important;
        width: 100px !important;
        transition: all 0.5s ease-in-out !important;
      }
    `;
    document.head.appendChild(style);

    window.addEventListener('message', handleMessage);
    logger.info('Message event listener attached');

    return () => {
      window.removeEventListener('message', handleMessage);
      document.head.removeChild(style);
      logger.info('Message event listener and styles cleaned up');
    };
  }, []);

  if (isStandaloneChat || isAuthPage || isLegalPage) {
    return null;
  }

  const targetOrigin = window.location.origin;
  logger.info('Chat widget initialized with target origin:', targetOrigin);

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
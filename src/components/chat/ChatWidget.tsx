import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { logger } from '@/utils/logger';

export function ChatWidget() {
  const location = useLocation();
  const isStandaloneChat = location.pathname === '/standalone-chat';
  const isAuthPage = location.pathname === '/auth' || location.pathname === '/onboarding';
  const isLegalPage = ['/terms', '/privacy', '/gdpr'].includes(location.pathname);

  useEffect(() => {
    // Load Zapier script
    const script = document.createElement('script');
    script.src = 'https://interfaces.zapier.com/assets/web-components/zapier-interfaces/zapier-interfaces.esm.js';
    script.type = 'module';
    script.async = true;
    document.body.appendChild(script);

    const allowedOrigins = [
      'https://neuralitix.com',
      'https://www.neuralitix.com',
      'http://localhost:3000',
      'https://gptengineer.app',
      'https://lovable.dev',
      'https://tlrrdakthzeytwpfygjn.supabase.co'
    ];

    const handleMessage = (event: MessageEvent) => {
      if (!allowedOrigins.includes(event.origin)) {
        logger.warn('Blocked message from unauthorized origin', {
          origin: event.origin,
          timestamp: new Date().toISOString(),
          allowedOrigins
        });
        return;
      }

      logger.info('Received message', {
        origin: event.origin,
        timestamp: new Date().toISOString(),
        messageType: event.data?.type
      });

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
            logger.info('Chatbot open triggered', {
              timestamp: new Date().toISOString(),
              success: true
            });
          } catch (error) {
            logger.error('Error opening chatbot', {
              error: error instanceof Error ? error.message : 'Unknown error',
              timestamp: new Date().toISOString(),
              stack: error instanceof Error ? error.stack : undefined
            });
          }
        }
      }
    };

    const defaultTimeout = 10000;
    const messageTimeout = setTimeout(() => {
      logger.warn('Message channel timeout reached', {
        timeout: window.MESSAGE_TIMEOUT || defaultTimeout,
        timestamp: new Date().toISOString()
      });
    }, window.MESSAGE_TIMEOUT || defaultTimeout);

    window.addEventListener('message', handleMessage);
    logger.info('Message event listener attached', {
      timestamp: new Date().toISOString(),
      allowedOrigins
    });

    return () => {
      window.removeEventListener('message', handleMessage);
      document.body.removeChild(script);
      clearTimeout(messageTimeout);
      logger.info('Chat widget cleanup completed', {
        timestamp: new Date().toISOString()
      });
    };
  }, []);

  if (isStandaloneChat || isAuthPage || isLegalPage) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <zapier-interfaces-chatbot-embed 
        id="chatbot-embed"
        is-popup='true' 
        chatbot-id='clqec2l2r00ca28qsdfz0m4my'
      />
    </div>
  );
}
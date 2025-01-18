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
      'https://lovable.dev',
      'https://tlrrdakthzeytwpfygjn.supabase.co'
    ];

    const handleMessage = (event: MessageEvent) => {
      // Enhanced origin validation with detailed logging
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

    // Set up timeout handling with default fallback
    const defaultTimeout = 10000; // 10 seconds default
    const messageTimeout = setTimeout(() => {
      logger.warn('Message channel timeout reached', {
        timeout: window.MESSAGE_TIMEOUT || defaultTimeout,
        timestamp: new Date().toISOString()
      });
    }, window.MESSAGE_TIMEOUT || defaultTimeout);

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
    logger.info('Message event listener attached', {
      timestamp: new Date().toISOString(),
      allowedOrigins
    });

    return () => {
      window.removeEventListener('message', handleMessage);
      document.head.removeChild(style);
      clearTimeout(messageTimeout);
      logger.info('Chat widget cleanup completed', {
        timestamp: new Date().toISOString()
      });
    };
  }, []);

  if (isStandaloneChat || isAuthPage || isLegalPage) {
    return null;
  }

  const targetOrigin = window.location.origin;
  // Validate target origin
  if (!targetOrigin.includes('neuralitix.com') && targetOrigin !== 'http://localhost:3000') {
    logger.warn('Invalid target origin detected', {
      targetOrigin,
      timestamp: new Date().toISOString()
    });
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
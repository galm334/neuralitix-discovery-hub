import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const Chat = () => {
  const [messages, setMessages] = useState<Array<{
    id: string;
    content: string;
    role: string;
    created_at: string;
  }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [initialResponseSent, setInitialResponseSent] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { conversationId } = useParams();

  useEffect(() => {
    console.log('Chat mounted, fetching messages for conversation:', conversationId);
    fetchMessages();
    const subscription = subscribeToMessages();
    return () => {
      subscription.unsubscribe();
    };
  }, [conversationId]);

  useEffect(() => {
    console.log('Messages updated:', messages);
    if (messages.length === 1 && messages[0].role === 'user' && !initialResponseSent) {
      console.log('Triggering initial response for query:', messages[0].content);
      handleInitialResponse(messages[0].content);
    }
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      console.log('Fetching messages for conversation:', conversationId);
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      console.log('Fetched messages:', data);
      setMessages(data || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Error fetching messages");
    }
  };

  const handleInitialResponse = async (userQuery: string) => {
    console.log('Generating initial response for query:', userQuery);
    setInitialResponseSent(true);
    setIsLoading(true);
    
    try {
      console.log('Calling chat-with-ai function...');
      const { data, error } = await supabase.functions.invoke('chat-with-ai', {
        body: { 
          query: userQuery,
          isFollowUp: false
        }
      });

      console.log('Received response from chat-with-ai:', data, error);

      if (error) throw error;
      
      if (!data.message) {
        throw new Error('No message in response');
      }

      // Format the response to include tools if available
      let formattedMessage = data.message;
      if (data.tools && data.tools.length > 0) {
        formattedMessage += "\n\nHere are some relevant AI tools:\n\n";
        data.tools.forEach((tool: any) => {
          formattedMessage += `### ${tool.name}\n`;
          formattedMessage += `${tool.description}\n`;
          formattedMessage += `Category: ${tool.category}\n\n`;
        });
      }

      console.log('Inserting assistant response:', formattedMessage);
      const { error: messageError } = await supabase
        .from("chat_messages")
        .insert([
          {
            conversation_id: conversationId,
            content: formattedMessage,
            role: "assistant",
          }
        ]);

      if (messageError) throw messageError;
      console.log('Assistant response inserted successfully');
    } catch (error) {
      console.error("Error sending initial response:", error);
      toast.error("Error getting response");
    } finally {
      setIsLoading(false);
    }
  };

  const subscribeToMessages = () => {
    console.log('Setting up real-time subscription for conversation:', conversationId);
    return supabase
      .channel(`chat_${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          console.log('Received new message via subscription:', payload);
          setMessages((current) => [...current, payload.new as any]);
        }
      )
      .subscribe();
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const renderMessage = (message: any) => {
    const isAssistant = message.role === "assistant";
    return (
      <div 
        className={`max-w-[80%] space-y-2 ${
          isAssistant ? "bg-muted p-4" : "bg-primary text-primary-foreground"
        } rounded-lg px-4 py-2`}
      >
        <div className="prose prose-sm dark:prose-invert">
          {message.content.split('\n').map((line: string, i: number) => {
            if (line.startsWith('###')) {
              return <h3 key={i} className="mt-2 mb-1 text-lg font-semibold">{line.replace('###', '')}</h3>;
            }
            return <p key={i} className="my-1">{line}</p>;
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen max-h-screen p-4">
      <div className="flex-1">
        <ScrollArea className="h-[calc(100vh-2rem)] rounded-lg border bg-background p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {renderMessage(message)}
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-center">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            )}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default Chat;
import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  const [newMessage, setNewMessage] = useState("");
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
      const { data, error } = await supabase.functions.invoke('chat-with-ai', {
        body: { query: userQuery }
      });

      if (error) throw error;
      
      console.log('AI response:', data);

      if (!data.message) {
        throw new Error('No message in AI response');
      }

      const { error: messageError } = await supabase
        .from("chat_messages")
        .insert([
          {
            conversation_id: conversationId,
            content: data.message,
            role: "assistant",
          }
        ]);

      if (messageError) throw messageError;
      console.log('Assistant response inserted successfully');
    } catch (error) {
      console.error("Error sending initial response:", error);
      toast.error("Error getting AI response");
    } finally {
      setIsLoading(false);
    }
  };

  const subscribeToMessages = () => {
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
          console.log('Received new message:', payload);
          setMessages((current) => [...current, payload.new as any]);
        }
      )
      .subscribe();
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setIsLoading(true);
    try {
      // First insert the user message
      const { error: userMessageError } = await supabase
        .from("chat_messages")
        .insert([
          {
            conversation_id: conversationId,
            content: newMessage,
            role: "user",
          }
        ]);

      if (userMessageError) throw userMessageError;

      // Then get AI response
      const { data: aiResponse, error: aiError } = await supabase.functions.invoke('chat-with-ai', {
        body: { query: newMessage }
      });

      if (aiError) throw aiError;

      if (!aiResponse.message) {
        throw new Error('No message in AI response');
      }

      // Insert AI response
      const { error: assistantMessageError } = await supabase
        .from("chat_messages")
        .insert([
          {
            conversation_id: conversationId,
            content: aiResponse.message,
            role: "assistant",
          }
        ]);

      if (assistantMessageError) throw assistantMessageError;

      setNewMessage("");
    } catch (error) {
      console.error("Error in chat interaction:", error);
      toast.error("Error sending message");
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const renderMessage = (message: any) => {
    return (
      <div className={`max-w-[80%] rounded-lg px-4 py-2 ${
        message.role === "assistant" ? "bg-muted" : "bg-primary text-primary-foreground"
      }`}>
        {message.content}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen max-h-screen p-4">
      <div className="flex-1 mb-4">
        <ScrollArea className="h-[calc(100vh-8rem)] rounded-lg border bg-background p-4">
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

      <form onSubmit={sendMessage} className="flex gap-2">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          disabled={isLoading}
          className="flex-1"
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send"}
        </Button>
      </form>
    </div>
  );
};

export default Chat;
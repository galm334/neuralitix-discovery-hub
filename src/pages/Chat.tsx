import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
    fetchMessages();
    subscribeToMessages();
  }, [conversationId]);

  useEffect(() => {
    if (messages.length === 1 && messages[0].role === 'user' && !initialResponseSent) {
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
      setMessages(data || []);
    } catch (error) {
      toast.error("Error fetching messages");
      console.error("Error fetching messages:", error);
    }
  };

  const handleInitialResponse = async (userQuery: string) => {
    setInitialResponseSent(true);
    setIsLoading(true);
    try {
      // First, search for relevant tools
      const { data: tools, error: searchError } = await supabase
        .from('ai_tools')
        .select('name, description, category')
        .textSearch('search_vector', userQuery.split(' ').join(' & '))
        .limit(3);

      if (searchError) throw searchError;

      // Format the tools into a response message
      let responseContent = `Here are some AI tools that match your query: "${userQuery}"\n\n`;
      
      if (tools && tools.length > 0) {
        tools.forEach((tool, index) => {
          responseContent += `${index + 1}. ${tool.name} - ${tool.description} (Category: ${tool.category})\n`;
        });
      } else {
        responseContent += "I couldn't find any exact matches, but I can help you explore similar tools. What specific features are you looking for?";
      }

      responseContent += "\nWould you like more specific information about any of these tools?";

      // Insert the response message
      const { error: messageError } = await supabase.from("chat_messages").insert([
        {
          conversation_id: conversationId,
          content: responseContent,
          role: "assistant",
        },
      ]);

      if (messageError) throw messageError;
    } catch (error) {
      toast.error("Error sending initial response");
      console.error("Error sending initial response:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel("schema-db-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          setMessages((current) => [...current, payload.new as any]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setIsLoading(true);
    try {
      const { error } = await supabase.from("chat_messages").insert([
        {
          conversation_id: conversationId,
          content: newMessage,
          role: "user",
        },
      ]);

      if (error) throw error;
      setNewMessage("");
    } catch (error) {
      toast.error("Error sending message");
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
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
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
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
          Send
        </Button>
      </form>
    </div>
  );
};

export default Chat;
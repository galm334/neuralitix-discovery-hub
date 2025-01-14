import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
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
      // Extract key terms from the query
      const searchTerms = userQuery.toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(' ')
        .filter(term => term.length > 3)
        .join(' | ');

      console.log('Searching with terms:', searchTerms);
      
      const { data: tools, error } = await supabase
        .from('ai_tools')
        .select('name, description, category')
        .textSearch('search_vector', searchTerms, {
          type: 'plain',
          config: 'english'
        })
        .limit(3);

      if (error) throw error;
      
      console.log('Found tools:', tools);

      let responseContent = `Here are some AI tools that match your search for "${userQuery}":\n\n`;
      
      if (tools && tools.length > 0) {
        tools.forEach((tool) => {
          const toolSlug = tool.name.toLowerCase().replace(/\s+/g, '-');
          responseContent += `<tool>
name: ${tool.name}
description: ${tool.description}
category: ${tool.category}
slug: ${toolSlug}
</tool>\n`;
        });
      } else {
        responseContent = "I couldn't find any exact matches for your search. Could you please try rephrasing your query or being more specific about what kind of AI tool you're looking for?";
      }

      console.log('Inserting assistant response:', responseContent);
      const { error: messageError } = await supabase
        .from("chat_messages")
        .insert([
          {
            conversation_id: conversationId,
            content: responseContent,
            role: "assistant",
          }
        ]);

      if (messageError) throw messageError;
      console.log('Assistant response inserted successfully');
    } catch (error) {
      console.error("Error sending initial response:", error);
      toast.error("Error sending initial response");
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

  const renderMessage = (message: any) => {
    if (message.role === "assistant" && message.content.includes("<tool>")) {
      const introText = message.content.split("\n\n")[0];
      const tools = message.content
        .split("<tool>")
        .slice(1)
        .map((toolStr: string) => {
          const lines = toolStr.split("\n").filter(Boolean);
          const toolData: any = {};
          lines.forEach((line: string) => {
            if (line.includes(": ")) {
              const [key, value] = line.split(": ");
              toolData[key] = value;
            }
          });
          return toolData;
        });

      return (
        <div className="space-y-4 w-full max-w-3xl">
          <p className="text-muted-foreground">{introText}</p>
          {tools.length > 0 && (
            <div className="space-y-4">
              {tools.map((tool: any, index: number) => (
                <Link 
                  key={index}
                  to={`/tool/${tool.slug}`}
                  className="block p-4 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors"
                >
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <h3 className="text-lg font-semibold hover:text-primary transition-colors">
                      {tool.name}
                    </h3>
                    <Badge variant="secondary" className="shrink-0">
                      {tool.category}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {tool.description}
                    <span className="ml-2 text-primary hover:underline">
                      See more
                    </span>
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="max-w-[80%] rounded-lg px-4 py-2 bg-muted">
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
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

const ChatNowButton = () => {
  const handleChatNow = () => {
    window.location.href = '/standalone-chat';
  };

  return (
    <Button 
      onClick={handleChatNow}
      className="bg-primary text-white px-6"
    >
      <MessageSquare className="mr-2 h-5 w-5" />
      Chat Now
    </Button>
  );
};

export default ChatNowButton;
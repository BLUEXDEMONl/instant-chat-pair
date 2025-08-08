import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Send, SkipForward, X, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  text: string;
  sender: 'you' | 'stranger';
  timestamp: Date;
}

interface ChatInterfaceProps {
  onDisconnect: () => void;
}

export default function ChatInterface({ onDisconnect }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [strangerStatus, setStrangerStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Simulate connection and stranger behavior
  useEffect(() => {
    const connectTimer = setTimeout(() => {
      setIsConnected(true);
      setStrangerStatus('connected');
      
      // Add initial stranger message
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        text: "Hello there! 👋",
        sender: 'stranger',
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }, 2000);

    return () => clearTimeout(connectTimer);
  }, []);

  // Simulate stranger responses
  useEffect(() => {
    if (messages.length > 0 && messages[messages.length - 1].sender === 'you') {
      setIsTyping(true);
      
      const responses = [
        "That's interesting! Tell me more",
        "How's your day going?",
        "Where are you from?",
        "What do you like to do for fun?",
        "Nice to meet you!",
        "Haha, that's funny 😄",
        "I agree with that",
        "What's the weather like there?",
        "What music do you listen to?",
        "Any hobbies?"
      ];
      
      const responseTimer = setTimeout(() => {
        setIsTyping(false);
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        const strangerMessage: Message = {
          id: Date.now().toString(),
          text: randomResponse,
          sender: 'stranger',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, strangerMessage]);
      }, 1000 + Math.random() * 2000);

      return () => clearTimeout(responseTimer);
    }
  }, [messages]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = () => {
    if (currentMessage.trim() && isConnected) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: currentMessage.trim(),
        sender: 'you',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, newMessage]);
      setCurrentMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleNext = () => {
    setStrangerStatus('connecting');
    setMessages([]);
    setIsConnected(false);
    
    // Simulate new connection
    setTimeout(() => {
      setIsConnected(true);
      setStrangerStatus('connected');
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        text: "Hey! How are you doing?",
        sender: 'stranger',
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }, 2000);
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card">
        <div className="flex items-center space-x-3">
          <Circle className={cn(
            "w-3 h-3 fill-current",
            strangerStatus === 'connected' && "text-status-online",
            strangerStatus === 'connecting' && "text-status-connecting animate-pulse",
            strangerStatus === 'disconnected' && "text-destructive"
          )} />
          <span className="font-medium">
            {strangerStatus === 'connected' && "Connected to Stranger"}
            {strangerStatus === 'connecting' && "Connecting..."}
            {strangerStatus === 'disconnected' && "Disconnected"}
          </span>
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleNext}
            disabled={strangerStatus !== 'connected'}
          >
            <SkipForward className="w-4 h-4 mr-2" />
            Next
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={onDisconnect}
          >
            <X className="w-4 h-4 mr-2" />
            Disconnect
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {strangerStatus === 'connecting' && (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Finding someone to chat with...</p>
          </div>
        )}
        
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex",
              message.sender === 'you' ? "justify-end" : "justify-start"
            )}
          >
            <div className="flex flex-col max-w-xs md:max-w-sm space-y-1">
              <Badge 
                variant="secondary" 
                className="text-xs w-fit px-2 py-1"
              >
                {message.sender === 'you' ? 'You' : 'Stranger'}
              </Badge>
              <Card
                className={cn(
                  "p-3",
                  message.sender === 'you' 
                    ? "bg-chat-bubble-you text-primary-foreground ml-auto" 
                    : "bg-chat-bubble-stranger text-foreground"
                )}
              >
                <p className="text-sm">{message.text}</p>
              </Card>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex flex-col max-w-xs space-y-1">
              <Badge variant="secondary" className="text-xs w-fit px-2 py-1">
                Stranger
              </Badge>
              <Card className="bg-chat-bubble-stranger text-foreground p-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </Card>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-border bg-card">
        <div className="flex space-x-2">
          <Input
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            disabled={!isConnected}
            className="flex-1 bg-chat-input border-border"
          />
          <Button
            onClick={sendMessage}
            disabled={!currentMessage.trim() || !isConnected}
            size="sm"
            className="px-4"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
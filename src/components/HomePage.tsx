import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Users, Zap, Shield } from "lucide-react";
import heroImage from "@/assets/hero-bg.jpg";

interface HomePageProps {
  onStartChat: () => void;
}

export default function HomePage({ onStartChat }: HomePageProps) {
  const [isConnecting, setIsConnecting] = useState(false);

  const handleStartChat = () => {
    setIsConnecting(true);
    // Simulate connection delay
    setTimeout(() => {
      onStartChat();
      setIsConnecting(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <div 
        className="relative h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-background/80" />
        <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
          <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Talk to Strangers
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Connect anonymously with people from around the world. No signup required.
          </p>
          
          <div className="flex items-center justify-center gap-4 mb-12">
            <Badge variant="secondary" className="px-4 py-2 text-sm">
              <Users className="w-4 h-4 mr-2" />
              1,247 online now
            </Badge>
            <Badge variant="outline" className="px-4 py-2 text-sm border-status-online text-status-online">
              <div className="w-2 h-2 bg-status-online rounded-full mr-2" />
              Anonymous & Safe
            </Badge>
          </div>

          <Button
            onClick={handleStartChat}
            disabled={isConnecting}
            size="lg"
            className="px-12 py-4 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 transform hover:scale-105"
          >
            {isConnecting ? (
              <>
                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                Connecting...
              </>
            ) : (
              <>
                <MessageCircle className="w-5 h-5 mr-2" />
                Start Chatting
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">Why Choose Our Platform?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 text-center bg-card border-border hover:border-primary/50 transition-colors">
              <Zap className="w-12 h-12 text-accent mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-4">Instant Connection</h3>
              <p className="text-muted-foreground">
                Get matched with someone new in seconds. No waiting, no delays.
              </p>
            </Card>
            
            <Card className="p-8 text-center bg-card border-border hover:border-primary/50 transition-colors">
              <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-4">100% Anonymous</h3>
              <p className="text-muted-foreground">
                No registration, no personal data. Your privacy is our priority.
              </p>
            </Card>
            
            <Card className="p-8 text-center bg-card border-border hover:border-primary/50 transition-colors">
              <MessageCircle className="w-12 h-12 text-status-online mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-4">Real-Time Chat</h3>
              <p className="text-muted-foreground">
                Smooth, lag-free messaging with people from around the globe.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
import { useState } from "react";
import HomePage from "@/components/HomePage";
import ChatInterface from "@/components/ChatInterface";

const Index = () => {
  const [currentView, setCurrentView] = useState<'home' | 'chat'>('home');

  const startChat = () => {
    setCurrentView('chat');
  };

  const disconnectChat = () => {
    setCurrentView('home');
  };

  return (
    <div className="min-h-screen">
      {currentView === 'home' ? (
        <HomePage onStartChat={startChat} />
      ) : (
        <ChatInterface onDisconnect={disconnectChat} />
      )}
    </div>
  );
};

export default Index;

import { useState, useRef, useEffect } from "react";
import { Send, RotateCcw, Bot, Loader2, Trash2, Sparkles } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAIChat } from "@/hooks/useAIChat";
import { useAuth } from "@/contexts/AuthContext";
import { useScheduleConflicts } from "@/hooks/useScheduleConflicts";
import { Link } from "react-router-dom";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { SuggestedPrompts } from "@/components/chat/SuggestedPrompts";
import { ConflictAlert } from "@/components/schedule/ConflictAlert";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const AIAssistant = () => {
  const { user } = useAuth();
  const { messages, isLoading, sendMessage, clearChat, regenerateLastMessage } =
    useAIChat();
  const { conflicts } = useScheduleConflicts();
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    sendMessage(input);
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handlePromptSelect = (prompt: string) => {
    sendMessage(prompt);
  };

  const showSuggestions = messages.length === 1; // Only welcome message

  return (
    <Layout>
      <div className="container py-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose to-rose-muted flex items-center justify-center shadow-lg">
              <Bot className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-semibold text-rose flex items-center gap-2">
                EventBot AI
                <Sparkles className="h-5 w-5" />
              </h1>
              <p className="text-sm text-muted-foreground">
                {user
                  ? "Personalized recommendations enabled"
                  : "Sign in for personalized suggestions"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={clearChat}
                  className="h-9 w-9"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Clear chat</TooltipContent>
            </Tooltip>
            <Button
              variant="outline"
              size="sm"
              onClick={clearChat}
              className="gap-2 hidden sm:flex"
            >
              <RotateCcw className="h-4 w-4" />
              New Chat
            </Button>
          </div>
        </div>

        {/* Conflict Alerts */}
        {conflicts.length > 0 && (
          <ConflictAlert conflicts={conflicts} className="mb-4" />
        )}

        {!user && (
          <div className="mb-4 p-4 rounded-lg bg-secondary/50 border border-border">
            <p className="text-sm text-muted-foreground">
              <Link
                to="/login"
                className="text-rose hover:underline font-medium"
              >
                Sign in
              </Link>{" "}
              to get personalized event recommendations based on your interests
              and past registrations.
            </p>
          </div>
        )}

        {/* Chat Container */}
        <div className="glass-card overflow-hidden flex flex-col h-[calc(100vh-280px)] min-h-[500px]">
          {/* Messages */}
          <ScrollArea className="flex-1">
            <div ref={scrollRef} className="p-4 space-y-6">
              {messages.map((message, index) => (
                <ChatMessage
                  key={message.id}
                  {...message}
                  isLoading={
                    isLoading &&
                    index === messages.length - 1 &&
                    message.role === "assistant"
                  }
                  onRegenerate={
                    message.role === "assistant" &&
                    index === messages.length - 1 &&
                    !isLoading
                      ? regenerateLastMessage
                      : undefined
                  }
                />
              ))}

              {/* Suggested Prompts - Only show when just welcome message */}
              {showSuggestions && !isLoading && (
                <SuggestedPrompts onSelect={handlePromptSelect} />
              )}

              {/* Loading indicator when waiting for first response */}
              {isLoading && messages[messages.length - 1]?.role === "user" && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose to-rose-muted flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Thinking...</span>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t border-border bg-card/50">
            <div className="flex items-end gap-2">
              <div className="flex-1 relative">
                <Textarea
                  ref={textareaRef}
                  placeholder="Ask about events, get recommendations, check schedules..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading}
                  className="min-h-[44px] max-h-[200px] resize-none pr-12"
                  rows={1}
                />
              </div>
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="bg-rose hover:bg-rose-muted text-primary-foreground h-11 px-4"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              EventBot can help with event discovery, recommendations, schedule
              conflicts, and more
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AIAssistant;

"use client";

import { DottedSurface } from "@/components/ui/dotted-surface";
import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles, Loader2, RefreshCw } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: string[];
  timestamp: Date;
}

export default function AIChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // First, perform search to get relevant documents
      const searchResponse = await fetch("http://localhost:5000/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: input,
          search_type: "hybrid",
        }),
      });

      const searchData = await searchResponse.json();
      
      // Send to AI endpoint for processing
      const aiResponse = await fetch("http://localhost:5000/ai-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: input,
          search_results: searchData.results || [],
          conversation_history: messages.slice(-5), // Last 5 messages for context
        }),
      });

      const aiData = await aiResponse.json();

      const assistantMessage: Message = {
        role: "assistant",
        content: aiData.response || "I couldn't generate a response. Please try again.",
        sources: aiData.sources || [],
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error:", error);
      const errorMessage: Message = {
        role: "assistant",
        content: "Sorry, I encountered an error. Please make sure the backend server is running and try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
  };

  return (
    <div className="relative min-h-screen flex flex-col">
      <DottedSurface className="fixed inset-0" />

      <div className="relative z-10 flex flex-col h-screen">
        {/* Header */}
        <div className="border-b border-border/50 bg-card/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="animate-fadeInUp">
                <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                    <Bot className="w-8 h-8 text-white" />
                  </div>
                  AI Information Retrieval
                </h1>
                <p className="text-muted-foreground">
                  Ask questions about your documents and get AI-powered answers with sources
                </p>
              </div>
              {messages.length > 0 && (
                <button
                  onClick={handleClearChat}
                  className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg hover:bg-muted transition"
                >
                  <RefreshCw className="w-4 h-4" />
                  Clear Chat
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-4 py-8 max-w-4xl">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-20 animate-fadeInUp">
                <div className="p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full mb-6">
                  <Sparkles className="w-16 h-16 text-purple-500" />
                </div>
                <h2 className="text-2xl font-bold mb-3">Start a Conversation</h2>
                <p className="text-muted-foreground max-w-md mb-6">
                  Ask any question about your documents. I'll search through them and provide detailed answers with sources.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl">
                  <button
                    onClick={() => setInput("What is information retrieval?")}
                    className="p-4 bg-card/50 border border-border rounded-lg hover:bg-card transition text-left"
                  >
                    <p className="text-sm font-medium">What is information retrieval?</p>
                  </button>
                  <button
                    onClick={() => setInput("Explain BM25 algorithm")}
                    className="p-4 bg-card/50 border border-border rounded-lg hover:bg-card transition text-left"
                  >
                    <p className="text-sm font-medium">Explain BM25 algorithm</p>
                  </button>
                  <button
                    onClick={() => setInput("What are the types of search algorithms?")}
                    className="p-4 bg-card/50 border border-border rounded-lg hover:bg-card transition text-left"
                  >
                    <p className="text-sm font-medium">What are the types of search algorithms?</p>
                  </button>
                  <button
                    onClick={() => setInput("How does semantic search work?")}
                    className="p-4 bg-card/50 border border-border rounded-lg hover:bg-card transition text-left"
                  >
                    <p className="text-sm font-medium">How does semantic search work?</p>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((message, idx) => (
                  <div
                    key={idx}
                    className={`flex gap-4 animate-slideDown ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                    style={{ animationDelay: `${idx * 0.1}s` }}
                  >
                    {message.role === "assistant" && (
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <Bot className="w-6 h-6 text-white" />
                      </div>
                    )}

                    <div
                      className={`max-w-[80%] rounded-2xl p-4 ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-card/80 backdrop-blur-sm border border-border"
                      }`}
                    >
                      <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:mt-3 prose-headings:mb-2 prose-p:my-2 prose-ul:my-2 prose-li:my-1">
                        {message.role === "assistant" ? (
                          <ReactMarkdown 
                            remarkPlugins={[remarkGfm]}
                            components={{
                              h3: ({node, ...props}) => <h3 className="text-base font-semibold text-foreground mt-4 mb-2 flex items-center gap-2" {...props} />,
                              h4: ({node, ...props}) => <h4 className="text-sm font-semibold text-foreground mt-3 mb-1.5 flex items-center gap-1.5" {...props} />,
                              h2: ({node, ...props}) => <h2 className="text-lg font-bold text-foreground mt-5 mb-2" {...props} />,
                              p: ({node, ...props}) => <p className="text-sm leading-relaxed my-2 text-foreground/90" {...props} />,
                              strong: ({node, ...props}) => <strong className="font-semibold text-foreground" {...props} />,
                              em: ({node, ...props}) => <em className="italic text-muted-foreground" {...props} />,
                              ul: ({node, ...props}) => <ul className="list-disc list-inside space-y-1.5 my-2 ml-2" {...props} />,
                              ol: ({node, ...props}) => <ol className="list-decimal list-inside space-y-1.5 my-2 ml-2" {...props} />,
                              li: ({node, ...props}) => <li className="text-sm leading-relaxed" {...props} />,
                              hr: ({node, ...props}) => <hr className="my-4 border-border/50" {...props} />,
                              blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-primary/50 pl-3 italic my-2" {...props} />,
                              code: ({node, ...props}) => <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono" {...props} />,
                            }}
                          >
                            {message.content}
                          </ReactMarkdown>
                        ) : (
                          <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                        )}
                      </div>

                      {message.sources && message.sources.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-border/50">
                          <p className="text-xs font-semibold mb-2 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            Sources ({message.sources.length})
                          </p>
                          <div className="space-y-1">
                            {message.sources.map((source, i) => (
                              <div
                                key={i}
                                className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded"
                              >
                                📄 {source}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <p className="text-xs text-muted-foreground mt-2">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>

                    {message.role === "user" && (
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                        <User className="w-6 h-6 text-white" />
                      </div>
                    )}
                  </div>
                ))}

                {loading && (
                  <div className="flex gap-4 justify-start animate-pulse">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <Bot className="w-6 h-6 text-white" />
                    </div>
                    <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-4">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <p className="text-sm text-muted-foreground">
                          Searching documents and generating response...
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>

        {/* Input Form */}
        <div className="border-t border-border/50 bg-card/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4 max-w-4xl">
            <form onSubmit={handleSubmit} className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question about your documents..."
                disabled={loading}
                className="flex-1 px-4 py-3 bg-background border-2 border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

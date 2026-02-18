"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export default function AIChatWidget() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: ChatMessage = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });
      const data = await res.json();

      if (data.response) {
        setMessages([
          ...newMessages,
          { role: "assistant", content: data.response },
        ]);
      } else {
        setMessages([
          ...newMessages,
          {
            role: "assistant",
            content:
              data.error ||
              "Sorry, I encountered an error. Please try again or create a support ticket.",
          },
        ]);
      }
    } catch {
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content:
            "Sorry, I encountered an error. Please try again or create a support ticket.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = () => {
    const summary = messages
      .map((m) => `${m.role === "user" ? "Customer" : "AI"}: ${m.content}`)
      .join("\n\n");
    sessionStorage.setItem("ai_chat_context", summary);
    router.push("/support/new");
  };

  const sendQuickQuestion = async (question: string) => {
    if (loading) return;
    const msg: ChatMessage = { role: "user", content: question };
    setMessages([msg]);
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [msg] }),
      });
      const data = await res.json();
      setMessages([
        msg,
        {
          role: "assistant",
          content: data.response || "Sorry, something went wrong.",
        },
      ]);
    } catch {
      setMessages([
        msg,
        { role: "assistant", content: "Sorry, I encountered an error." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Render markdown-ish text: links, bold, and code
  const renderMarkdown = (text: string) => {
    // Split by markdown patterns and build React elements
    const parts: (string | React.ReactElement)[] = [];
    let remaining = text;
    let key = 0;

    while (remaining.length > 0) {
      // Find the next markdown pattern
      const linkMatch = remaining.match(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/);
      const boldMatch = remaining.match(/\*\*([^*]+)\*\*/);

      // Find which comes first
      const linkIdx = linkMatch ? remaining.indexOf(linkMatch[0]) : Infinity;
      const boldIdx = boldMatch ? remaining.indexOf(boldMatch[0]) : Infinity;

      if (linkIdx === Infinity && boldIdx === Infinity) {
        // No more patterns — push remaining text
        parts.push(remaining);
        break;
      }

      if (linkIdx <= boldIdx && linkMatch) {
        // Link comes first
        if (linkIdx > 0) parts.push(remaining.substring(0, linkIdx));
        parts.push(
          <a
            key={key++}
            href={linkMatch[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#00d4ff] underline hover:text-[#00b8d9]"
          >
            {linkMatch[1]}
          </a>
        );
        remaining = remaining.substring(linkIdx + linkMatch[0].length);
      } else if (boldMatch) {
        // Bold comes first
        if (boldIdx > 0) parts.push(remaining.substring(0, boldIdx));
        parts.push(
          <strong key={key++} className="font-semibold text-[#f1f5f9]">
            {boldMatch[1]}
          </strong>
        );
        remaining = remaining.substring(boldIdx + boldMatch[0].length);
      }
    }

    return parts;
  };

  return (
    <div className="card overflow-hidden border-[#7c3aed]/30 bg-gradient-to-r from-[#7c3aed]/5 to-[#00d4ff]/5">
      {/* Header — always visible */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#7c3aed]/20 flex items-center justify-center">
            <svg
              className="w-5 h-5 text-[#7c3aed]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z"
              />
            </svg>
          </div>
          <div className="text-left">
            <h3 className="font-medium text-[#f1f5f9]">AI Support Assistant</h3>
            <p className="text-sm text-[#94a3b8]">
              Get instant help with setup, troubleshooting, and more
            </p>
          </div>
        </div>
        <svg
          className={`w-5 h-5 text-[#94a3b8] transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Chat area — expandable */}
      {isOpen && (
        <div className="border-t border-[#1e293b]">
          {/* Messages */}
          <div className="max-h-[400px] overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-6">
                <p className="text-[#94a3b8] text-sm">
                  Ask me anything about setup, troubleshooting, billing, or your
                  account.
                </p>
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                  {[
                    "I'm switching to the new app",
                    "How do I set up my Firestick?",
                    "Why is my stream buffering?",
                  ].map((q) => (
                    <button
                      key={q}
                      onClick={() => sendQuickQuestion(q)}
                      className="px-3 py-1.5 text-xs rounded-full border border-[#334155] text-[#94a3b8] hover:border-[#00d4ff] hover:text-[#00d4ff] transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg px-4 py-3 ${
                    msg.role === "user"
                      ? "bg-[#00d4ff]/10 border border-[#00d4ff]/30 text-[#f1f5f9]"
                      : "bg-[#1e293b] border border-[#334155] text-[#e2e8f0]"
                  }`}
                >
                  {msg.role === "assistant" && (
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-[#7c3aed]">
                        AI Assistant
                      </span>
                    </div>
                  )}
                  <div className="text-sm whitespace-pre-wrap leading-relaxed">
                    {msg.role === "assistant" ? renderMarkdown(msg.content) : msg.content}
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-[#1e293b] border border-[#334155] rounded-lg px-4 py-3">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[#7c3aed]">
                      AI Assistant
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-[#94a3b8] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-[#94a3b8] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-[#94a3b8] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Create ticket button */}
          {messages.length >= 4 && (
            <div className="px-4 pb-2">
              <button
                onClick={handleCreateTicket}
                className="w-full text-sm text-[#94a3b8] hover:text-[#00d4ff] transition-colors py-2 border border-dashed border-[#334155] hover:border-[#00d4ff]/50 rounded-lg"
              >
                Still need help? Create a support ticket
              </button>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-[#1e293b] flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your question..."
              disabled={loading}
              className="flex-1 bg-[#0f172a] border border-[#334155] rounded-lg px-4 py-2.5 text-sm text-[#f1f5f9] placeholder-[#64748b] focus:outline-none focus:border-[#00d4ff] disabled:opacity-50"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              className="px-4 py-2.5 bg-[#7c3aed] hover:bg-[#6d28d9] disabled:opacity-50 disabled:hover:bg-[#7c3aed] rounded-lg transition-colors"
            >
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Trash2, BrainCircuit, User, ChevronDown,
  Sparkles, MessageSquare, Copy, Check,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/utils/format";
import { SUGGESTED_PROMPTS, AI_RESPONSES } from "@/data/ai.data";
import { CASES } from "@/data/cases.data";
import type { ChatMessage } from "@/types/ai.types";

// ─── Markdown-lite renderer ───────────────────────────────────────────────────
function renderContent(text: string) {
  const lines = text.split("\n");
  return lines.map((line, i) => {
    if (line.startsWith("**") && line.endsWith("**")) {
      return <p key={i} className="font-bold text-foreground mt-2 mb-1">{line.slice(2, -2)}</p>;
    }
    if (line.match(/^\*\*(.+)\*\*$/)) {
      const parts = line.split(/\*\*(.+?)\*\*/g);
      return (
        <p key={i} className="text-sm leading-relaxed">
          {parts.map((p, j) => j % 2 === 1 ? <strong key={j}>{p}</strong> : p)}
        </p>
      );
    }
    if (line.startsWith("- ") || line.startsWith("1. ") || line.startsWith("2. ") || line.startsWith("3. ") || line.startsWith("4. ") || line.startsWith("5. ")) {
      return <li key={i} className="text-sm ml-4 leading-relaxed list-disc">{line.replace(/^[-\d]+\. /, "").replace(/^- /, "")}</li>;
    }
    if (line.startsWith("#")) {
      return <h3 key={i} className="font-semibold text-foreground mt-2">{line.replace(/^#+\s/, "")}</h3>;
    }
    if (line.startsWith("| ")) {
      return null; // skip table lines in simple renderer
    }
    if (line.startsWith("✅") || line.startsWith("❌") || line.startsWith("⚠️") || line.startsWith("🔴") || line.startsWith("🟠") || line.startsWith("🟡")) {
      return <p key={i} className="text-sm leading-relaxed py-0.5">{line}</p>;
    }
    if (line === "") return <br key={i} />;
    return <p key={i} className="text-sm leading-relaxed">{line}</p>;
  });
}

// ─── Message bubble ───────────────────────────────────────────────────────────
function MessageBubble({ msg }: { msg: ChatMessage }) {
  const [copied, setCopied] = useState(false);
  const isUser = msg.role === "user";

  const handleCopy = () => {
    navigator.clipboard.writeText(msg.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={cn("flex items-start gap-3 group", isUser && "flex-row-reverse")}
    >
      {/* Avatar */}
      <div className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-sm font-bold",
        isUser ? "bg-[hsl(var(--primary))] text-white" : "bg-emerald-600 text-white",
      )}>
        {isUser ? <User className="h-4 w-4" /> : <BrainCircuit className="h-4 w-4" />}
      </div>

      {/* Bubble */}
      <div className={cn("max-w-[80%] space-y-1", isUser && "items-end flex flex-col")}>
        <div className={cn(
          "rounded-2xl px-4 py-3 text-sm",
          isUser
            ? "bg-[hsl(var(--primary))] text-white rounded-tr-sm"
            : "bg-muted/60 dark:bg-slate-800 text-foreground rounded-tl-sm border border-border",
        )}>
          {msg.typing ? (
            <div className="flex items-center gap-1 py-1">
              {[0, 1, 2].map(i => (
                <motion.div key={i} className="h-2 w-2 rounded-full bg-muted-foreground/60"
                  animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }} />
              ))}
            </div>
          ) : isUser ? (
            <p>{msg.content}</p>
          ) : (
            <div className="space-y-0.5">{renderContent(msg.content)}</div>
          )}
        </div>
        <div className={cn("flex items-center gap-2", isUser ? "flex-row-reverse" : "flex-row")}>
          <span className="text-2xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
            {formatRelativeTime(msg.timestamp)}
          </span>
          {!isUser && !msg.typing && (
            <button onClick={handleCopy} className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground">
              {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function AIAssistantPage() {
  const [messages, setMessages]   = useState<ChatMessage[]>([
    { id: "0", role: "assistant", content: AI_RESPONSES.default, timestamp: new Date() },
  ]);
  const [input, setInput]         = useState("");
  const [isTyping, setIsTyping]   = useState(false);
  const [selectedCase, setSelectedCase] = useState(CASES[0].id);
  const [showPrompts, setShowPrompts]   = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getAIResponse = (query: string): string => {
    const q = query.toLowerCase();
    if (q.includes("summar"))         return AI_RESPONSES.summarize;
    if (q.includes("next"))           return AI_RESPONSES["next step"];
    if (q.includes("missing"))        return AI_RESPONSES.missing;
    if (q.includes("delay") || q.includes("why")) return AI_RESPONSES.delay;
    if (q.includes("document"))       return AI_RESPONSES.documents;
    if (q.includes("recommend"))      return AI_RESPONSES.recommendations;
    if (q.includes("risk"))           return AI_RESPONSES.risk;
    if (q.includes("ready") || q.includes("court")) return AI_RESPONSES.readiness;
    if (q.includes("assign") || q.includes("officer")) return AI_RESPONSES.assign;
    if (q.includes("analytic") || q.includes("timeline")) return AI_RESPONSES.analytics;
    return AI_RESPONSES.default;
  };

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), role: "user", content: text.trim(), timestamp: new Date() };
    const typingMsg: ChatMessage = { id: "typing", role: "assistant", content: "", timestamp: new Date(), typing: true };

    setMessages(prev => [...prev, userMsg, typingMsg]);
    setInput("");
    setIsTyping(true);
    setShowPrompts(false);

    await new Promise(r => setTimeout(r, 900 + Math.random() * 800));

    const response = getAIResponse(text);
    const aiMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: "assistant", content: response, timestamp: new Date() };
    setMessages(prev => [...prev.filter(m => m.id !== "typing"), aiMsg]);
    setIsTyping(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  };

  const clearConversation = () => {
    setMessages([{ id: "0", role: "assistant", content: AI_RESPONSES.default, timestamp: new Date() }]);
    setShowPrompts(true);
  };

  const caseObj = CASES.find(c => c.id === selectedCase);

  return (
    <DashboardLayout>
      <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-140px)]">

        {/* ── Sidebar ── */}
        <div className="lg:w-72 shrink-0 flex flex-col gap-3">
          {/* Case selector */}
          <div className="rounded-xl border border-border bg-card p-4 space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Active Case Context</p>
            <div className="relative">
              <select value={selectedCase} onChange={e => setSelectedCase(e.target.value)}
                className="w-full h-9 rounded-lg border border-border bg-background px-3 pr-8 text-xs focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] appearance-none dark:bg-slate-900 dark:text-white">
                {CASES.map(c => <option key={c.id} value={c.id}>{c.caseNumber.split("/").pop()} — {c.district}</option>)}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            </div>
            {caseObj && (
              <div className="text-xs space-y-1 pt-1 border-t border-border">
                <div className="flex justify-between text-muted-foreground"><span>Stage</span><span className="font-medium text-foreground">{caseObj.currentStageOrder}/{caseObj.totalStages}</span></div>
                <div className="flex justify-between text-muted-foreground"><span>Status</span><span className="font-medium text-foreground capitalize">{caseObj.status.replace("_"," ")}</span></div>
                <div className="flex justify-between text-muted-foreground"><span>Officer</span><span className="font-medium text-foreground truncate max-w-[120px]">{caseObj.assignedOfficer}</span></div>
              </div>
            )}
          </div>

          {/* Suggested prompts */}
          <div className="rounded-xl border border-border bg-card p-4 flex-1 overflow-y-auto">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Suggested Questions</p>
            <div className="space-y-1.5">
              {SUGGESTED_PROMPTS.map((p, i) => (
                <button key={i} onClick={() => sendMessage(p.text)}
                  className="w-full text-left flex items-start gap-2.5 rounded-lg px-3 py-2 text-xs text-foreground hover:bg-muted transition-colors group">
                  <span className="shrink-0 text-sm">{p.icon}</span>
                  <span className="group-hover:text-[hsl(var(--primary))] transition-colors leading-relaxed">{p.text}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Chat panel ── */}
        <div className="flex-1 flex flex-col rounded-xl border border-border bg-card overflow-hidden min-h-0">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-5 py-3.5 shrink-0">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600/10 text-emerald-600">
                <BrainCircuit className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">SAKSHI AI Assistant</p>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className={cn("h-1.5 w-1.5 rounded-full", isTyping ? "bg-amber-400 animate-pulse" : "bg-emerald-400")} />
                  {isTyping ? "Analyzing case data…" : "Online"}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden sm:flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-1 text-2xs font-medium text-emerald-700 dark:text-emerald-400">
                <Sparkles className="h-3 w-3" /> POCSO AI v1.0
              </span>
              <button onClick={clearConversation} className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                <Trash2 className="h-3.5 w-3.5" /> Clear
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollable">
            <AnimatePresence>
              {showPrompts && messages.length === 1 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
                  {SUGGESTED_PROMPTS.slice(0, 6).map((p, i) => (
                    <button key={i} onClick={() => sendMessage(p.text)}
                      className="flex items-start gap-2 rounded-xl border border-border bg-muted/40 hover:bg-muted hover:border-[hsl(var(--primary))]/30 p-3 text-left transition-all group">
                      <span className="shrink-0">{p.icon}</span>
                      <span className="text-xs text-muted-foreground group-hover:text-foreground leading-relaxed">{p.text}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {messages.map(msg => <MessageBubble key={msg.id} msg={msg} />)}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t border-border p-4 shrink-0">
            <div className="flex items-end gap-3">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about this case… (Enter to send, Shift+Enter for new line)"
                  rows={2}
                  disabled={isTyping}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] transition-colors dark:bg-slate-900 dark:text-white disabled:opacity-50 scrollable"
                />
              </div>
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isTyping}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            <div className="flex items-center gap-4 mt-2">
              <p className="text-2xs text-muted-foreground flex items-center gap-1">
                <MessageSquare className="h-3 w-3" /> {messages.filter(m => m.role === "assistant" && !m.typing).length} responses
              </p>
              <p className="text-2xs text-muted-foreground">AI responses are based on procedural guidelines and case data.</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

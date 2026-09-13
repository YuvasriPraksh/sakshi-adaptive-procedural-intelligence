import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Trash2, BrainCircuit, User, ChevronDown,
  Sparkles, MessageSquare, Copy, Check, AlertTriangle, ShieldCheck, HelpCircle, ArrowRight
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/utils/format";
import { caseService } from "@/services/caseService";
import { aiService } from "@/services/aiService";
import type { ChatMessage, AIChatResponse } from "@/types/ai.types";
import type { InvestigationCase } from "@/types/case.types";

const COPILOT_QUICK_ACTIONS = [
  { label: "Summarize Case", icon: "📋", prompt: "Summarize the current procedural state of this case.", intent: "summarize_case" },
  { label: "Why is Evidence Review blocked?", icon: "🛑", prompt: "Why is Evidence Review blocked?", intent: "explain_blocker" },
  { label: "What Should Happen Next?", icon: "⏩", prompt: "What should happen next in this investigation?", intent: "next_steps" },
  { label: "What Information is Missing?", icon: "🔍", prompt: "What information or reports are currently missing?", intent: "missing_info" },
  { label: "Explain Deadline Risk", icon: "⏳", prompt: "What deadlines require attention for this case?", intent: "deadline_risk" },
];

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
    if (line.startsWith("✅") || line.startsWith("❌") || line.startsWith("⚠️") || line.startsWith("🔴") || line.startsWith("🟠") || line.startsWith("🟡")) {
      return <p key={i} className="text-sm leading-relaxed py-0.5">{line}</p>;
    }
    if (line === "") return <br key={i} />;
    return <p key={i} className="text-sm leading-relaxed">{line}</p>;
  });
}

// ─── Structured Copilot Card ──────────────────────────────────────────────────
function StructuredCopilotCard({ data }: { data: AIChatResponse }) {
  return (
    <div className="space-y-3 text-sm">
      {/* Summary */}
      <p className="font-medium text-foreground leading-relaxed">{data.summary}</p>

      {/* Observations */}
      {data.observations && data.observations.length > 0 && (
        <div className="rounded-lg bg-sky-500/10 border border-sky-500/20 p-3 space-y-1.5">
          <div className="flex items-center gap-1.5 text-2xs font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
            <ShieldCheck className="h-3.5 w-3.5" /> D-POG Observations
          </div>
          <ul className="space-y-1 text-xs text-foreground/90 list-disc list-inside">
            {data.observations.map((obs, idx) => (
              <li key={idx} className="leading-relaxed">{obs}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommendations */}
      {data.recommendations && data.recommendations.length > 0 && (
        <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 space-y-1.5">
          <div className="flex items-center gap-1.5 text-2xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
            <ArrowRight className="h-3.5 w-3.5" /> Operational Recommendations
          </div>
          <ul className="space-y-1 text-xs text-foreground/90 list-disc list-inside">
            {data.recommendations.map((rec, idx) => (
              <li key={idx} className="leading-relaxed">{rec}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Basis & Dependencies */}
      {data.basis && data.basis.length > 0 && (
        <div className="text-2xs text-muted-foreground flex items-center gap-1 flex-wrap pt-1">
          <span className="font-semibold text-foreground/70">Basis:</span>
          {data.basis.map((b, idx) => (
            <span key={idx} className="bg-muted px-2 py-0.5 rounded text-foreground/80 border border-border">
              {b}
            </span>
          ))}
        </div>
      )}

      {/* Uncertainties */}
      {data.uncertainties && data.uncertainties.length > 0 && (
        <div className="text-2xs text-amber-600 dark:text-amber-400 flex items-start gap-1.5 bg-amber-500/10 border border-amber-500/20 p-2 rounded">
          <HelpCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Uncertainties: </span>
            {data.uncertainties.join("; ")}
          </div>
        </div>
      )}

      {/* Human Approval Required Badge */}
      {data.humanApprovalRequired && (
        <div className="flex items-center gap-1.5 text-2xs text-muted-foreground bg-muted/50 p-2 rounded border border-border mt-2">
          <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
          <span>Human review required — SAKSHI AI provides operational decision support only.</span>
        </div>
      )}
    </div>
  );
}

// ─── Message bubble ───────────────────────────────────────────────────────────
function MessageBubble({ msg }: { msg: ChatMessage }) {
  const [copied, setCopied] = useState(false);
  const isUser = msg.role === "user";

  const handleCopy = () => {
    navigator.clipboard.writeText(msg.copilotData?.formattedText || msg.content);
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
      <div className={cn("max-w-[85%] space-y-1", isUser && "items-end flex flex-col")}>
        <div className={cn(
          "rounded-2xl px-4 py-3 text-sm",
          isUser
            ? "bg-[hsl(var(--primary))] text-white rounded-tr-sm"
            : "bg-muted/60 dark:bg-slate-800 text-foreground rounded-tl-sm border border-border w-full",
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
          ) : msg.copilotData ? (
            <StructuredCopilotCard data={msg.copilotData} />
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
  const [cases, setCases]               = useState<InvestigationCase[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string>("");
  const [messages, setMessages]         = useState<ChatMessage[]>([
    {
      id: "0",
      role: "assistant",
      content: "Welcome to the SAKSHI AI Procedural Copilot. Grounded in the live Dynamic Procedural Obligation Graph (D-POG), I can explain active blockers, downstream impacts, next actionable tasks, and statutory milestone compliance. How can I assist you with this investigation?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput]               = useState("");
  const [isTyping, setIsTyping]         = useState(false);
  const [showPrompts, setShowPrompts]   = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    async function loadCases() {
      try {
        const res = await caseService.list();
        if (res.success && res.data && res.data.length > 0) {
          setCases(res.data);
          setSelectedCaseId(res.data[0].id);
        }
      } catch (err) {
        console.error("Failed to load cases in AI copilot", err);
      }
    }
    loadCases();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string, intent?: string) => {
    if (!text.trim() || isTyping) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), role: "user", content: text.trim(), timestamp: new Date() };
    const typingMsg: ChatMessage = { id: "typing", role: "assistant", content: "", timestamp: new Date(), typing: true };

    setMessages(prev => [...prev, userMsg, typingMsg]);
    setInput("");
    setIsTyping(true);
    setShowPrompts(false);

    try {
      const response = await aiService.chat(text.trim(), selectedCaseId, intent);
      if (response.success && response.data) {
        const aiMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: response.data.formattedText || response.data.summary,
          copilotData: response.data,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev.filter(m => m.id !== "typing"), aiMsg]);
      } else {
        throw new Error(response.message || "Failed to receive copilot analysis");
      }
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `⚠️ Error contacting Copilot service: ${err?.message || "Please ensure the case exists and try again."}`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev.filter(m => m.id !== "typing"), errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const clearConversation = () => {
    setMessages([
      {
        id: "0",
        role: "assistant",
        content: "Conversation cleared. Active D-POG procedural context is loaded for the selected case. Ask any operational question or select a predefined action.",
        timestamp: new Date(),
      },
    ]);
    setShowPrompts(true);
  };

  const currentCase = cases.find(c => c.id === selectedCaseId);

  return (
    <DashboardLayout>
      <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-140px)]">

        {/* ── Sidebar ── */}
        <div className="lg:w-72 shrink-0 flex flex-col gap-3">
          {/* Case selector */}
          <div className="rounded-xl border border-border bg-card p-4 space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Active Case Context</p>
            <div className="relative">
              <select
                value={selectedCaseId}
                onChange={e => setSelectedCaseId(e.target.value)}
                className="w-full h-9 rounded-lg border border-border bg-background px-3 pr-8 text-xs focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] appearance-none dark:bg-slate-900 dark:text-white"
              >
                {cases.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.caseNumber} — {c.district}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            </div>
            {currentCase && (
              <div className="text-xs space-y-1 pt-1 border-t border-border">
                <div className="flex justify-between text-muted-foreground"><span>Crime Type</span><span className="font-medium text-foreground">{currentCase.crimeType || "POCSO"}</span></div>
                <div className="flex justify-between text-muted-foreground"><span>Victim Ref</span><span className="font-medium text-foreground">{currentCase.victimCode || "Protected"}</span></div>
                <div className="flex justify-between text-muted-foreground"><span>Stage</span><span className="font-medium text-foreground">{currentCase.currentStageOrder}/{currentCase.totalStages}</span></div>
                <div className="flex justify-between text-muted-foreground"><span>Status</span><span className="font-medium text-foreground capitalize">{currentCase.status.replace("_"," ")}</span></div>
              </div>
            )}
          </div>

          {/* Predefined Actions */}
          <div className="rounded-xl border border-border bg-card p-4 flex-1 overflow-y-auto">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Copilot Actions</p>
            <div className="space-y-1.5">
              {COPILOT_QUICK_ACTIONS.map((action, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(action.prompt, action.intent)}
                  disabled={isTyping}
                  className="w-full text-left flex items-start gap-2.5 rounded-lg px-3 py-2 text-xs text-foreground hover:bg-muted transition-colors group disabled:opacity-50"
                >
                  <span className="shrink-0 text-sm">{action.icon}</span>
                  <span className="group-hover:text-[hsl(var(--primary))] transition-colors leading-relaxed font-medium">{action.label}</span>
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
                <p className="text-sm font-semibold text-foreground">SAKSHI AI Procedural Copilot</p>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className={cn("h-1.5 w-1.5 rounded-full", isTyping ? "bg-amber-400 animate-pulse" : "bg-emerald-400")} />
                  {isTyping ? "Evaluating D-POG & generating analysis…" : "Grounded in D-POG Engine"}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden sm:flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-1 text-2xs font-medium text-emerald-700 dark:text-emerald-400">
                <Sparkles className="h-3 w-3" /> D-POG Grounded
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
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mb-4">
                  {COPILOT_QUICK_ACTIONS.map((p, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(p.prompt, p.intent)}
                      className="flex items-start gap-2 rounded-xl border border-border bg-muted/40 hover:bg-muted hover:border-[hsl(var(--primary))]/30 p-3 text-left transition-all group"
                    >
                      <span className="shrink-0 text-base">{p.icon}</span>
                      <div>
                        <p className="text-xs font-semibold text-foreground group-hover:text-[hsl(var(--primary))]">{p.label}</p>
                        <p className="text-2xs text-muted-foreground line-clamp-1">{p.prompt}</p>
                      </div>
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
                  placeholder="Ask the Copilot about procedural bottlenecks, next steps, or deadlines…"
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
            <div className="flex items-center justify-between mt-2">
              <p className="text-2xs text-muted-foreground flex items-center gap-1">
                <MessageSquare className="h-3 w-3" /> {messages.filter(m => m.role === "assistant" && !m.typing).length} responses
              </p>
              <p className="text-2xs text-muted-foreground text-right">
                Grounded strictly in D-POG state. Human review required for all decisions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

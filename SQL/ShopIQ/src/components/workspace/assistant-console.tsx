"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bot, CheckCircle2, Send, Sparkles, Wand2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FormattedAiContent } from "@/utils/ai-content";
import { cn } from "@/lib/utils";

type ChatMessage = {
  role: "USER" | "AI";
  content: string;
  action?: { label: string; href: string } | null;
  previewAction?: { type: string; payload: Record<string, any>; previewId: string } | null;
};

function actionLabel(type?: string) {
  if (type === "create_product") return "Product preview";
  if (type === "create_customer") return "Customer preview";
  if (type === "create_supplier") return "Supplier preview";
  return "Action preview";
}

export function AssistantConsole({ initialThreadId }: { initialThreadId?: string }) {
  const [threadId, setThreadId] = useState<string | undefined>(initialThreadId);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [agentMode, setAgentMode] = useState(true);
  const router = useRouter();

  async function ask(prompt?: string) {
    const finalQuestion = prompt || question;
    if (!finalQuestion.trim() || loading) return;
    setLoading(true);
    setMessages((current) => [...current, { role: "USER", content: finalQuestion }]);
    setQuestion("");
    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ threadId, question: finalQuestion, agentMode })
      });
      const data = await response.json();
      if (data.thread?.id) setThreadId(data.thread.id);
      setMessages((current) => [
        ...current,
        {
          role: "AI",
          content: data.answer || data.error || "No response returned.",
          action: data.action || null,
          previewAction: data.previewAction || null
        }
      ]);
      router.refresh();
    } catch {
      setMessages((current) => [
        ...current,
        { role: "AI", content: "## Assistant unavailable\n\nI could not complete that request right now. Please try again." }
      ]);
    } finally {
      setLoading(false);
    }
  }

  const chips = [
    "Summarize the latest business day",
    "Which products should I reorder?",
    "Which customers owe me money?",
    "Create customer: Bright Star School, phone 03001234567, address Gulberg Lahore, credit limit 250000",
    "Add product: HP EliteBook 840, category Laptops, cost 190000, sale price 225000, stock 8, low stock 3"
  ];

  return (
    <Card className="assistant-console overflow-hidden">
      <CardContent className="p-0">
        <div className="crud-header p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Bot className="size-5" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold tracking-normal">ShopIQ AI Copilot</p>
                <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
                  Context-aware assistant with preview-first business actions from live shop data.
                </p>
              </div>
            </div>
            <Button variant={agentMode ? "default" : "outline"} onClick={() => setAgentMode((current) => !current)} className="shrink-0">
              {agentMode ? <Sparkles className="size-4" /> : <Wand2 className="size-4" />}
              {agentMode ? "Agent mode on" : "Agent mode off"}
            </Button>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {chips.map((chip) => (
              <button key={chip} type="button" className="assistant-chip" onClick={() => ask(chip)}>
                {chip}
              </button>
            ))}
          </div>
        </div>

        <div className="flex max-h-[520px] flex-col gap-3 overflow-y-auto bg-muted/10 p-4">
          {messages.length ? (
            messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={cn(
                  "message-bubble",
                  message.role === "AI" ? "border-primary/20 bg-primary/5" : "ml-auto max-w-[92%] border-border bg-background md:max-w-[78%]"
                )}
              >
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{message.role === "AI" ? "ShopIQ Copilot" : "You"}</p>
                  {message.previewAction ? <Badge variant="warning">{actionLabel(message.previewAction.type)}</Badge> : null}
                  {message.action ? <Badge variant="success">Completed</Badge> : null}
                </div>
                <FormattedAiContent content={message.content} />
                {message.previewAction ? (
                  <div className="mt-4 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-muted-foreground">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
                      <div>
                        <p className="font-medium text-foreground">Waiting for your approval</p>
                        <p className="mt-1 leading-6">
                          Reply <span className="font-semibold text-foreground">Yes, add it</span> to save this preview to the database, or reply <span className="font-semibold text-foreground">Cancel</span> to discard it.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : null}
                {message.action ? (
                  <Button className="mt-4" asChild>
                    <Link href={message.action.href}>{message.action.label}</Link>
                  </Button>
                ) : null}
              </div>
            ))
          ) : (
            <div className="empty-state">Ask about reorder plans, dues, stock risk, sales trends, or create products/customers/suppliers through preview-first agent mode.</div>
          )}
        </div>

        <div className="flex flex-col gap-3 border-t border-border/70 bg-background/60 p-4 sm:flex-row">
          <Input
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Ask a business question or give a ShopIQ action..."
            onKeyDown={(event) => {
              if (event.key === "Enter") ask();
            }}
          />
          <Button onClick={() => ask()} disabled={loading || !question.trim()}>
            <Send className="size-4" />
            {loading ? "Thinking..." : "Ask"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

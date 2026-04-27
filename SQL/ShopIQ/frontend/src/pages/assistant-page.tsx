import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageCard } from "@/components/page-card";
import { MarkdownMessage } from "@/components/markdown-message";
import { api } from "@/lib/http";
import { prettyDate } from "@/lib/utils";

type Thread = {
  aiThreadId: string;
  title: string;
  updatedAt: string;
};

type Message = {
  aiMessageId: string;
  role: "USER" | "ASSISTANT" | "SYSTEM";
  content: string;
  createdAt: string;
};

export function AssistantPage() {
  const queryClient = useQueryClient();
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);

  const threadsQuery = useQuery({
    queryKey: ["ai-threads"],
    queryFn: () => api.get<Thread[]>("/ai/threads")
  });

  useEffect(() => {
    if (!activeThreadId && threadsQuery.data?.length) {
      setActiveThreadId(threadsQuery.data[0].aiThreadId);
    }
  }, [threadsQuery.data, activeThreadId]);

  const messagesQuery = useQuery({
    queryKey: ["ai-messages", activeThreadId],
    queryFn: () => api.get<Message[]>(`/ai/threads/${activeThreadId}/messages`),
    enabled: Boolean(activeThreadId)
  });

  const createThreadMutation = useMutation({
    mutationFn: () => api.post<Thread>("/ai/threads", { title: "New conversation" }),
    onSuccess: (thread) => {
      toast.success("Thread created.");
      setActiveThreadId(thread.aiThreadId);
      void queryClient.invalidateQueries({ queryKey: ["ai-threads"] });
    }
  });

  const sendMessageMutation = useMutation({
    mutationFn: (message: string) => api.post(`/ai/threads/${activeThreadId}/messages`, { message }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["ai-messages", activeThreadId] });
      void queryClient.invalidateQueries({ queryKey: ["ai-threads"] });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Failed to send message.")
  });

  const groupedMessages = useMemo(() => messagesQuery.data ?? [], [messagesQuery.data]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const message = String(form.get("message")).trim();
    if (!message) return;
    if (!activeThreadId) {
      toast.error("Create a thread first.");
      return;
    }
    sendMessageMutation.mutate(message);
    event.currentTarget.reset();
  };

  return (
    <div className="assistant-grid">
      <PageCard
        title="Saved threads"
        subtitle="All conversations are stored in the backend."
        actions={
          <button className="primary-button" type="button" onClick={() => createThreadMutation.mutate()}>
            New thread
          </button>
        }
      >
        <div className="list-stack">
          {threadsQuery.data?.map((thread) => (
            <button
              key={thread.aiThreadId}
              type="button"
              className={thread.aiThreadId === activeThreadId ? "thread-button thread-button--active" : "thread-button"}
              onClick={() => setActiveThreadId(thread.aiThreadId)}
            >
              <strong>{thread.title}</strong>
              <span>{prettyDate(thread.updatedAt)}</span>
            </button>
          ))}
        </div>
      </PageCard>

      <PageCard title="ShopIQ AI" subtitle="Gemini-backed assistant with formatted markdown responses.">
        <div className="chat-window">
          {groupedMessages.map((message) => (
            <div key={message.aiMessageId} className={message.role === "USER" ? "chat-bubble chat-bubble--user" : "chat-bubble"}>
              {message.role === "ASSISTANT" ? <MarkdownMessage content={message.content} /> : <p>{message.content}</p>}
            </div>
          ))}
        </div>

        <form className="chat-form" onSubmit={handleSubmit}>
          <input name="message" className="field__input" placeholder="Ask about collections, debtors, staff, or your shop." required />
          <button className="primary-button" type="submit" disabled={sendMessageMutation.isPending}>
            {sendMessageMutation.isPending ? "Thinking..." : "Send"}
          </button>
        </form>
      </PageCard>
    </div>
  );
}

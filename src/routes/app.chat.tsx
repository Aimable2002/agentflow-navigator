import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowUp, Paperclip } from "lucide-react";
import { InlineTaskCard, TierBadge } from "@/components/pink/primitives";
import { connectors, conversations, tasks, type ChatMessage } from "@/lib/mock";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/chat")({
  head: () => ({
    meta: [
      { title: "Agent chat | PINK workspace" },
      {
        name: "description",
        content: "Talk to the PINK agent, watch it call your connected tools and follow background tasks inline.",
      },
      { property: "og:title", content: "PINK agent chat" },
      { property: "og:description", content: "One surface for conversation, tool actions and background execution." },
    ],
  }),
  component: Chat,
});

const suggestions = [
  "Backtest my mean-reversion EA on EURUSD M15 and file the results in Linear",
  "Why is CI red on release/1.8? Fix it and open a PR",
  "Reconcile last month in Xero and list what needs a decision",
  "Summarise the HubSpot pipeline and flag stalled deals",
];

function Bubble({ m }: { m: ChatMessage }) {
  const task = m.taskId ? tasks.find((t) => t.id === m.taskId) : undefined;
  if (m.role === "user") {
    return (
      <div className="flex gap-3">
        <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-md bg-panel font-mono text-[11px] text-fog">
          YOU
        </span>
        <p className="max-w-2xl text-sm leading-relaxed text-white/90">{m.text}</p>
      </div>
    );
  }
  return (
    <div className="stream-in flex gap-3">
      <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-md bg-pink font-mono text-[11px] font-semibold text-ink">
        P
      </span>
      <div className="min-w-0 max-w-2xl space-y-3">
        {m.tier && (
          <div className="flex items-center gap-2">
            <TierBadge tier={m.tier} />
            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-mute">routed automatically</span>
          </div>
        )}
        <p className="text-sm leading-relaxed text-white/90">{m.text}</p>
        {m.steps && (
          <div className="space-y-2">
            {m.steps.map((s) => (
              <div key={`${s.connector}${s.action}`} className="flex items-center gap-2 font-mono text-xs text-fog">
                <span className="size-1.5 rounded-full bg-mint" /> {s.connector} · {s.action}{" "}
                <span className="text-mute">{s.detail}</span>
              </div>
            ))}
          </div>
        )}
        {task && (
          <InlineTaskCard
            taskId={task.id}
            title={task.title}
            tier={task.tier}
            status={task.status}
            progress={task.progress}
            meta={`${task.id} · ${task.duration}`}
          />
        )}
      </div>
    </div>
  );
}

function Chat() {
  const base = conversations[0]!;
  const [thread, setThread] = useState<ChatMessage[]>(base.thread);
  const [draft, setDraft] = useState("");

  const send = (text: string) => {
    if (!text.trim()) return;
    setThread((t) => [
      ...t,
      { id: `u${t.length}`, role: "user", text },
      {
        id: `a${t.length}`,
        role: "agent",
        tier: "medium",
        text: "Graded that as a multi-step job and routed it to the medium tier. I'll report back here and keep a task card in this conversation while it runs.",
        steps: [{ connector: "github", action: "read repository", detail: "acme-labs/core" }],
        taskId: "TSK-1420",
      },
    ]);
    setDraft("");
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <div className="flex flex-wrap items-center gap-3 border-b border-line px-4 py-4 lg:px-8">
        <div>
          <h1 className="font-display text-lg font-semibold">{base.title}</h1>
          <p className="font-mono text-[11px] text-mute">
            {base.id} · connectors in scope: {base.connectorsUsed.join(", ")}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Link
            to="/app/conversations"
            className="rounded-md border border-line px-3 py-2 font-mono text-[11px] uppercase tracking-[0.1em] text-fog hover:text-white"
          >
            History
          </Link>
          <Link
            to="/app/tasks"
            className="rounded-md border border-line px-3 py-2 font-mono text-[11px] uppercase tracking-[0.1em] text-violet hover:text-white"
          >
            2 running
          </Link>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6 lg:px-8">
        <div className="mx-auto max-w-3xl space-y-6">
          {thread.map((m) => (
            <Bubble key={m.id} m={m} />
          ))}
        </div>
      </div>

      <div className="border-t border-line px-4 py-4 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="flex flex-wrap gap-2 pb-3">
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => send(s)}
                className="rounded-full border border-line bg-panel px-3 py-1.5 text-xs text-fog transition-colors hover:border-pink/40 hover:text-white"
              >
                {s}
              </button>
            ))}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(draft);
            }}
            className="rounded-lg border border-line bg-ink2 p-3"
          >
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={2}
              placeholder="Describe the outcome you want. The agent picks the tier and the tools."
              className="w-full resize-none bg-transparent text-sm text-white placeholder:text-mute focus:outline-none"
            />
            <div className="flex items-center gap-2 pt-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-mute">Tier: auto</span>
              <div className="flex gap-1">
                {connectors
                  .filter((c) => c.connected)
                  .map((c) => (
                    <span
                      key={c.id}
                      className="rounded border border-line px-1.5 py-0.5 font-mono text-[10px] text-fog"
                    >
                      {c.name}
                    </span>
                  ))}
              </div>
              <button type="button" aria-label="Attach file" className="ml-auto text-mute hover:text-white">
                <Paperclip className="size-4" />
              </button>
              <button
                type="submit"
                aria-label="Send message"
                className={cn(
                  "grid size-8 place-items-center rounded-md bg-pink text-ink transition-colors hover:bg-white",
                  !draft.trim() && "opacity-50",
                )}
              >
                <ArrowUp className="size-4" />
              </button>
            </div>
          </form>
          <p className="mt-2 font-mono text-[10px] text-mute">
            Free tier · best-effort priority. Long jobs move to background tasks automatically.
          </p>
        </div>
      </div>
    </div>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/app/app-shell";
import { InlineTaskCard, Meter, Panel, StatusPill, TierBadge } from "@/components/pink/primitives";
import { connectors, conversations, tasks, usage, tierMeta } from "@/lib/mock";

export const Route = createFileRoute("/app/")({
  head: () => ({
    meta: [
      { title: "Overview | PINK workspace" },
      { name: "description", content: "Your agent activity, connected tools, running tasks and usage at a glance." },
      { property: "og:title", content: "PINK workspace overview" },
      { property: "og:description", content: "Account activity, connectors, recent agent work and usage." },
    ],
  }),
  component: Overview,
});

function Overview() {
  const running = tasks.filter((t) => t.status === "running");
  const connected = connectors.filter((c) => c.connected);
  const pct = Math.round((usage.requestsUsed / usage.requestsLimit) * 100);

  return (
    <>
      <PageHeader
        title="Good afternoon, Avery"
        copy="Two tasks are in flight and your Xero connection needs a look. Everything else is quiet."
        actions={
          <>
            <Link
              to="/app/chat"
              className="rounded-md bg-pink px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-white"
            >
              New conversation
            </Link>
            <Link
              to="/app/tasks"
              className="rounded-md border border-line px-4 py-2.5 text-sm text-white transition-colors hover:bg-panel"
            >
              View tasks
            </Link>
          </>
        }
      />

      <div className="space-y-6 p-4 lg:p-8">
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Panel>
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-mute">Requests this month</p>
            <p className="mt-2 font-display text-3xl font-semibold">{usage.requestsUsed}</p>
            <p className="font-mono text-xs text-fog">of {usage.requestsLimit} on {usage.plan}</p>
            <div className="mt-3">
              <Meter value={pct} tone={pct > 80 ? "pink" : "mute"} />
            </div>
          </Panel>
          <Panel>
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-mute">Tasks running</p>
            <p className="mt-2 font-display text-3xl font-semibold text-violet">{running.length}</p>
            <p className="font-mono text-xs text-fog">
              {usage.concurrent} of {usage.concurrentLimit} concurrent slots
            </p>
            <div className="mt-3">
              <Meter value={(usage.concurrent / usage.concurrentLimit) * 100} tone="violet" />
            </div>
          </Panel>
          <Panel>
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-mute">Connected tools</p>
            <p className="mt-2 font-display text-3xl font-semibold">{connected.length}</p>
            <p className="font-mono text-xs text-fog">of {connectors.length} available</p>
            <Link to="/app/connectors" className="mt-3 inline-block font-mono text-[11px] text-pink hover:underline">
              Manage connectors →
            </Link>
          </Panel>
          <Panel accent>
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-mute">Estimated spend</p>
            <p className="mt-2 font-display text-3xl font-semibold">{usage.spend}</p>
            <p className="font-mono text-xs text-fog">Free tier · best-effort priority</p>
            <Link to="/app/billing" className="mt-3 inline-block font-mono text-[11px] text-pink hover:underline">
              Upgrade for priority →
            </Link>
          </Panel>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <Panel>
            <div className="flex items-center">
              <h2 className="font-display text-lg font-semibold">In flight now</h2>
              <Link to="/app/tasks" className="ml-auto font-mono text-[11px] text-fog hover:text-white">
                All tasks →
              </Link>
            </div>
            <div className="mt-4 space-y-3">
              {running.map((t) => (
                <InlineTaskCard
                  key={t.id}
                  taskId={t.id}
                  title={t.title}
                  tier={t.tier}
                  status={t.status}
                  progress={t.progress}
                  meta={`${t.id} · ${t.duration}`}
                />
              ))}
            </div>

            <h3 className="mt-8 font-mono text-[11px] uppercase tracking-[0.14em] text-mute">Recent agent activity</h3>
            <ul className="mt-3 divide-y divide-line">
              {tasks.slice(3).map((t) => (
                <li key={t.id}>
                  <Link
                    to="/app/tasks/$taskId"
                    params={{ taskId: t.id }}
                    className="flex flex-wrap items-center gap-3 py-3 hover:text-white"
                  >
                    <StatusPill status={t.status} />
                    <span className="text-sm text-white">{t.title}</span>
                    <TierBadge tier={t.tier} className="ml-auto" />
                    <span className="font-mono text-[11px] text-mute">{t.duration}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </Panel>

          <div className="space-y-4">
            <Panel>
              <h2 className="font-display text-lg font-semibold">Tier mix</h2>
              <div className="mt-4 space-y-4">
                {usage.byTier.map((t) => (
                  <div key={t.tier}>
                    <div className="flex items-center gap-2">
                      <TierBadge tier={t.tier} />
                      <span className="ml-auto font-mono text-xs text-fog">{t.requests} req</span>
                      <span className="font-mono text-xs text-mute">{t.cost}</span>
                    </div>
                    <div className="mt-2">
                      <Meter value={t.share} tone={t.tier === "best" ? "pink" : t.tier === "medium" ? "mute" : "mint"} />
                    </div>
                    <p className="mt-1 font-mono text-[10px] text-mute">{tierMeta[t.tier].note}</p>
                  </div>
                ))}
              </div>
              <Link to="/app/usage" className="mt-5 inline-block font-mono text-[11px] text-pink hover:underline">
                Full usage breakdown →
              </Link>
            </Panel>

            <Panel>
              <h2 className="font-display text-lg font-semibold">Connections</h2>
              <ul className="mt-4 space-y-3">
                {connectors.map((c) => (
                  <li key={c.id} className="flex items-center gap-3">
                    <Link
                      to="/app/connectors/$connectorId"
                      params={{ connectorId: c.id }}
                      className="text-sm text-white hover:text-pink"
                    >
                      {c.name}
                    </Link>
                    <span
                      className={
                        c.connected
                          ? c.health === "degraded"
                            ? "ml-auto font-mono text-[11px] text-amber"
                            : "ml-auto font-mono text-[11px] text-mint"
                          : "ml-auto font-mono text-[11px] text-mute"
                      }
                    >
                      {c.connected ? (c.health === "degraded" ? "needs attention" : "connected") : "not connected"}
                    </span>
                  </li>
                ))}
              </ul>
            </Panel>

            <Panel>
              <h2 className="font-display text-lg font-semibold">Latest conversations</h2>
              <ul className="mt-4 space-y-3">
                {conversations.slice(0, 4).map((c) => (
                  <li key={c.id}>
                    <Link
                      to="/app/conversations/$conversationId"
                      params={{ conversationId: c.id }}
                      className="block text-sm text-fog hover:text-white"
                    >
                      {c.title}
                      <span className="block font-mono text-[10px] text-mute">
                        {c.id} · {c.updated}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </Panel>
          </div>
        </section>
      </div>
    </>
  );
}

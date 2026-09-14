/**
 * Client for the PINK agent backend (FastAPI). The backend queues an agent run
 * and returns a job id; task state itself is read from the database.
 */
import { supabase } from "@/integrations/supabase/client";

export const PINK_API_URL = ((import.meta.env["VITE_PINK_API_URL"] as string | undefined) ?? "").replace(/\/$/, "");

export const isApiConfigured = PINK_API_URL.length > 0;

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (!isApiConfigured) {
    throw new ApiError(0, "The agent backend is not connected yet.");
  }
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  const response = await fetch(`${PINK_API_URL}${path}`, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new ApiError(response.status, body || `Request failed (${response.status})`);
  }
  return (await response.json()) as T;
}

export type ChatPlan = {
  tier: "small" | "medium" | "best";
  difficulty?: number;
  reason?: string;
};

export type StartChatResponse = {
  job_id: string;
  status: string;
  plan?: ChatPlan;
};

export type JobStatusResponse = {
  status: "pending" | "done" | "failed";
  result?: { content?: string; steps?: { connector: string; action: string; detail?: string }[] };
  error?: string;
};

export function startChat(input: { prompt: string; conversation_id?: string; connectors?: string[] }) {
  return request<StartChatResponse>("/v1/chat", { method: "POST", body: JSON.stringify(input) });
}

export function getJob(jobId: string) {
  return request<JobStatusResponse>(`/v1/chat/${jobId}`);
}

export function apiHealth() {
  return request<{ status: string }>("/health");
}

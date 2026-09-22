import type { Lead, LeadCreateInput, LeadStatus } from "./types";

// In production this is injected at build time via Render's env vars.
// Locally it falls back to the FastAPI dev server.
const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let details: unknown;
    try {
      details = await res.json();
    } catch {
      details = undefined;
    }
    const message =
      (details as { detail?: string } | undefined)?.detail ??
      `Request failed with status ${res.status}`;
    throw new ApiError(message, res.status, details);
  }
  return res.json() as Promise<T>;
}

export interface ListLeadsParams {
  search?: string;
  status?: LeadStatus | "";
}

export async function listLeads(params: ListLeadsParams = {}): Promise<Lead[]> {
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  if (params.status) query.set("status", params.status);

  const res = await fetch(`${API_BASE_URL}/api/leads?${query.toString()}`);
  return handleResponse<Lead[]>(res);
}

export async function createLead(input: LeadCreateInput): Promise<Lead> {
  const res = await fetch(`${API_BASE_URL}/api/leads`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return handleResponse<Lead>(res);
}

export async function updateLeadStatus(
  id: string,
  status: LeadStatus,
): Promise<Lead> {
  const res = await fetch(`${API_BASE_URL}/api/leads/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  return handleResponse<Lead>(res);
}

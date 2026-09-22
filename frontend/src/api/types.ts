export const LEAD_STATUSES = [
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "CONVERTED",
  "LOST",
] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number];

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: LeadStatus;
  created_at: string;
}

export interface LeadCreateInput {
  name: string;
  email: string;
  phone: string;
}

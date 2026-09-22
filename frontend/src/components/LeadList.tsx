import type { Lead, LeadStatus } from "../api/types";
import { StatusSelect } from "./StatusSelect";

interface LeadListProps {
  leads: Lead[];
  loading: boolean;
  error: string | null;
  updatingIds: Set<string>;
  onStatusChange: (leadId: string, status: LeadStatus) => void;
  hasFilters: boolean;
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function LeadList({
  leads,
  loading,
  error,
  updatingIds,
  onStatusChange,
  hasFilters,
}: LeadListProps) {
  return (
    <div className="ledger">
      <div className="ledger__head" role="row">
        <span>Name</span>
        <span>Contact</span>
        <span>Phone</span>
        <span>Status</span>
        <span>Added</span>
      </div>

      {loading && (
        <div className="state-row">
          <p className="state-row__title">Loading leads…</p>
        </div>
      )}

      {!loading && error && (
        <div className="state-row">
          <p className="state-row__title">Couldn't load leads</p>
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && leads.length === 0 && (
        <div className="state-row">
          <p className="state-row__title">
            {hasFilters ? "No leads match your search" : "No leads yet"}
          </p>
          <p>
            {hasFilters
              ? "Try a different search term or clear the status filter."
              : "Add your first lead to start tracking it here."}
          </p>
        </div>
      )}

      {!loading &&
        !error &&
        leads.map((lead) => (
          <div className="ledger__row" role="row" key={lead.id}>
            <span className="ledger__name">{lead.name}</span>
            <span className="ledger__email" title={lead.email}>
              {lead.email}
            </span>
            <span className="ledger__phone">{lead.phone}</span>
            <span>
              <StatusSelect
                value={lead.status}
                leadName={lead.name}
                disabled={updatingIds.has(lead.id)}
                onChange={(status) => onStatusChange(lead.id, status)}
              />
            </span>
            <span className="ledger__date">{formatDate(lead.created_at)}</span>
          </div>
        ))}
    </div>
  );
}

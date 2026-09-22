import { LEAD_STATUSES, type LeadStatus } from "../api/types";

interface ToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: LeadStatus | "";
  onStatusFilterChange: (value: LeadStatus | "") => void;
  onAddLead: () => void;
  addDisabled?: boolean;
}

const STATUS_LABELS: Record<LeadStatus, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  QUALIFIED: "Qualified",
  CONVERTED: "Converted",
  LOST: "Lost",
};

export function Toolbar({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  onAddLead,
  addDisabled,
}: ToolbarProps) {
  return (
    <div className="toolbar">
      <div className="toolbar__search">
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by name, email or phone…"
          aria-label="Search leads"
        />
      </div>

      <select
        className="select"
        value={statusFilter}
        onChange={(e) => onStatusFilterChange(e.target.value as LeadStatus | "")}
        aria-label="Filter by status"
      >
        <option value="">All statuses</option>
        {LEAD_STATUSES.map((status) => (
          <option key={status} value={status}>
            {STATUS_LABELS[status]}
          </option>
        ))}
      </select>

      <button className="btn btn--primary" onClick={onAddLead} disabled={addDisabled}>
        + New lead
      </button>
    </div>
  );
}

import { LEAD_STATUSES, type LeadStatus } from "../api/types";

const STATUS_LABELS: Record<LeadStatus, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  QUALIFIED: "Qualified",
  CONVERTED: "Converted",
  LOST: "Lost",
};

interface StatusSelectProps {
  value: LeadStatus;
  disabled?: boolean;
  onChange: (status: LeadStatus) => void;
  leadName: string;
}

export function StatusSelect({
  value,
  disabled,
  onChange,
  leadName,
}: StatusSelectProps) {
  return (
    <select
      className="status-select"
      data-status={value}
      value={value}
      disabled={disabled}
      aria-label={`Status for ${leadName}`}
      onChange={(e) => onChange(e.target.value as LeadStatus)}
    >
      {LEAD_STATUSES.map((status) => (
        <option key={status} value={status}>
          {STATUS_LABELS[status]}
        </option>
      ))}
    </select>
  );
}

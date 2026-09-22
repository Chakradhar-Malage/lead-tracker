import { useCallback, useEffect, useMemo, useState } from "react";
import { ApiError, createLead, listLeads, updateLeadStatus } from "./api/leads";
import type { Lead, LeadCreateInput, LeadStatus } from "./api/types";
import { LeadForm } from "./components/LeadForm";
import { LeadList } from "./components/LeadList";
import { Toolbar } from "./components/Toolbar";

export default function App() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "">("");

  const [showForm, setShowForm] = useState(false);
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());

  // Debounce the search box so we don't fire a request on every keystroke.
  useEffect(() => {
    const handle = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(handle);
  }, [search]);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await listLeads({
        search: debouncedSearch || undefined,
        status: statusFilter || undefined,
      });
      setLeads(data);
    } catch (err) {
      setLoadError(
        err instanceof ApiError
          ? err.message
          : "Something went wrong while loading leads.",
      );
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, statusFilter]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const handleCreateLead = async (input: LeadCreateInput) => {
    const created = await createLead(input);
    setShowForm(false);
    // Only splice the new lead into the visible list if it would actually
    // match the current filters — otherwise just leave the list as-is.
    const matchesStatusFilter = !statusFilter || created.status === statusFilter;
    const q = debouncedSearch.trim().toLowerCase();
    const matchesSearch =
      !q ||
      created.name.toLowerCase().includes(q) ||
      created.email.toLowerCase().includes(q) ||
      created.phone.toLowerCase().includes(q);

    if (matchesStatusFilter && matchesSearch) {
      setLeads((prev) => [created, ...prev]);
    }
  };

  const handleStatusChange = async (leadId: string, status: LeadStatus) => {
    const previous = leads;
    setUpdatingIds((prev) => new Set(prev).add(leadId));
    // Optimistic update so the UI feels instant; rolled back on failure.
    setLeads((prev) =>
      prev.map((lead) => (lead.id === leadId ? { ...lead, status } : lead)),
    );

    try {
      const updated = await updateLeadStatus(leadId, status);
      setLeads((prev) =>
        prev.map((lead) => (lead.id === leadId ? updated : lead)),
      );
      // If a status filter is active and this lead no longer matches it,
      // drop it from view on the next natural refetch trigger.
      if (statusFilter && updated.status !== statusFilter) {
        setLeads((prev) => prev.filter((lead) => lead.id !== leadId));
      }
    } catch {
      setLeads(previous);
    } finally {
      setUpdatingIds((prev) => {
        const next = new Set(prev);
        next.delete(leadId);
        return next;
      });
    }
  };

  const leadCountLabel = useMemo(() => {
    if (loading) return "Loading…";
    const count = leads.length;
    return `${count} lead${count === 1 ? "" : "s"} tracked`;
  }, [leads.length, loading]);

  return (
    <div className="page">
      <header className="masthead">
        <h1 className="masthead__title">
          <em>Ledger</em>
        </h1>
        <span className="masthead__meta">{leadCountLabel}</span>
      </header>

      <Toolbar
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onAddLead={() => setShowForm((v) => !v)}
        addDisabled={showForm}
      />

      {showForm && (
        <LeadForm
          onSubmit={handleCreateLead}
          onCancel={() => setShowForm(false)}
        />
      )}

      <LeadList
        leads={leads}
        loading={loading}
        error={loadError}
        updatingIds={updatingIds}
        onStatusChange={handleStatusChange}
        hasFilters={Boolean(debouncedSearch) || Boolean(statusFilter)}
      />
    </div>
  );
}

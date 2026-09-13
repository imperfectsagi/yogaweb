"use client";

import { useState } from "react";
import { AdminPageHeader, AdminAlert, AdminCard, Select } from "@/components/admin/AdminUI";
import { Phone, Mail } from "lucide-react";

type Lead = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  interested_service: string | null;
  preferred_mode: string | null;
  preferred_time: string | null;
  message: string | null;
  source: string | null;
  status: string;
  created_at: string;
};

const STATUS_OPTIONS = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "trial_scheduled", label: "Trial Scheduled" },
  { value: "joined", label: "Joined" },
  { value: "not_interested", label: "Not Interested" },
  { value: "closed", label: "Closed" },
];

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-100 text-blue-700",
  contacted: "bg-yellow-100 text-yellow-700",
  trial_scheduled: "bg-purple-100 text-purple-700",
  joined: "bg-green-100 text-green-700",
  not_interested: "bg-gray-100 text-gray-500",
  closed: "bg-gray-100 text-gray-500",
};

export function LeadsClient({ initialLeads }: { initialLeads: Lead[] }) {
  const [leads, setLeads] = useState(initialLeads);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function handleStatusChange(id: string, status: string) {
    setUpdatingId(id);
    setError(null);
    const prev = leads;
    setLeads((l) => l.map((lead) => (lead.id === id ? { ...lead, status } : lead)));
    try {
      const res = await fetch(`/api/admin/leads/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        setLeads(prev);
        setError("Could not update lead status.");
      }
    } catch {
      setLeads(prev);
      setError("Network error. Please try again.");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div>
      <AdminPageHeader title="Leads" description="Enquiries submitted through the website's contact and free-class forms." />
      {error && <AdminAlert type="error">{error}</AdminAlert>}

      {leads.length === 0 ? (
        <AdminCard>
          <p className="text-sm text-muted text-center py-6">No leads yet.</p>
        </AdminCard>
      ) : (
        <div className="space-y-3">
          {leads.map((lead) => (
            <AdminCard key={lead.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium">{lead.name}</p>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_COLORS[lead.status] || ""}`}>
                      {STATUS_OPTIONS.find((s) => s.value === lead.status)?.label || lead.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted mt-0.5">
                    {new Date(lead.created_at).toLocaleString()}
                    {lead.interested_service ? ` · ${lead.interested_service}` : ""}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-3 text-sm">
                    {lead.phone && (
                      <a href={`tel:${lead.phone}`} className="inline-flex items-center gap-1 text-primary hover:underline">
                        <Phone className="h-3.5 w-3.5" /> {lead.phone}
                      </a>
                    )}
                    {lead.email && (
                      <a href={`mailto:${lead.email}`} className="inline-flex items-center gap-1 text-primary hover:underline">
                        <Mail className="h-3.5 w-3.5" /> {lead.email}
                      </a>
                    )}
                  </div>
                  {lead.message && <p className="mt-2 text-sm text-muted">{lead.message}</p>}
                </div>
                <Select
                  value={lead.status}
                  onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                  disabled={updatingId === lead.id}
                  className="w-auto shrink-0"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </Select>
              </div>
            </AdminCard>
          ))}
        </div>
      )}
    </div>
  );
}

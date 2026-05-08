import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { toast } from "sonner";

const STATUSES = ["open", "in_progress", "resolved", "rejected"];

export function GrievancesSection({ ulbId }: { ulbId: string }) {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    if (!ulbId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("grievances").select("*").eq("ulb_id", ulbId).order("created_at", { ascending: false });
    setLoading(false);
    if (error) return toast.error(error.message);
    setRows(data ?? []);
  }
  useEffect(() => { load(); }, [ulbId]);

  async function update(id: string, patch: any) {
    const { error } = await supabase.from("grievances").update(patch).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Updated"); load();
  }
  async function remove(id: string) {
    if (!confirm("Delete this grievance?")) return;
    const { error } = await supabase.from("grievances").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted"); load();
  }

  return (
    <div className="mt-4 grid gap-3">
      <h2 className="font-display text-xl font-bold text-gov-navy">Grievances</h2>
      {loading ? <p className="text-sm text-muted-foreground">Loading…</p>
        : rows.length === 0 ? <p className="text-sm text-muted-foreground">No grievances.</p>
        : rows.map((r) => (
          <Card key={r.id} className="p-4 grid gap-2">
            <div className="flex justify-between items-start gap-3 flex-wrap">
              <div>
                <div className="font-bold">{r.ticket_no} · {r.category}</div>
                <div className="text-sm">{r.citizen_name} · {r.phone}{r.email ? ` · ${r.email}` : ""}</div>
                <div className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString()}</div>
              </div>
              <div className="w-40">
                <Select value={r.status} onValueChange={(v) => update(r.id, { status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <p className="text-sm">{r.description}</p>
            {r.address && <p className="text-xs text-muted-foreground">📍 {r.address}</p>}
            <Textarea
              placeholder="Admin notes…"
              defaultValue={r.admin_notes ?? ""}
              onBlur={(e) => e.target.value !== (r.admin_notes ?? "") && update(r.id, { admin_notes: e.target.value })}
            />
            <div className="flex justify-end">
              <Button variant="destructive" size="sm" onClick={() => remove(r.id)}>Delete</Button>
            </div>
          </Card>
        ))}
    </div>
  );
}
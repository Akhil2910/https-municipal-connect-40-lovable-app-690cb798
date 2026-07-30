import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

type Row = { id: string; hostname: string; ulb_id: string };

export function DomainsSection({ ulbs }: { ulbs: { id: string; name: string; slug: string }[] }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [hostname, setHostname] = useState("");
  const [ulbId, setUlbId] = useState("");

  async function load() {
    const { data, error } = await supabase.from("domains").select("id,hostname,ulb_id").order("hostname");
    if (error) return toast.error(error.message);
    setRows((data ?? []) as Row[]);
  }
  useEffect(() => { load(); }, []);

  async function add() {
    const clean = hostname.trim().toLowerCase().replace(/^https?:\/\//, "").split("/")[0];
    if (!clean || !ulbId) return toast.error("Enter a hostname and pick a municipality");
    const { error } = await supabase.from("domains").insert({ hostname: clean, ulb_id: ulbId });
    if (error) return toast.error(error.message);
    toast.success(`${clean} mapped`);
    setHostname("");
    load();
  }

  async function remove(id: string) {
    const { error } = await supabase.from("domains").delete().eq("id", id);
    if (error) return toast.error(error.message);
    load();
  }

  const nameById = new Map(ulbs.map((u) => [u.id, u.name]));

  return (
    <div className="space-y-4 py-4">
      <Card className="p-4 space-y-3">
        <h3 className="font-display font-bold">Map a domain to a municipality</h3>
        <p className="text-sm text-muted-foreground">
          Add each municipality's hostname (and its <code>www.</code> variant). Visitors on that domain see that
          municipality's site at the root URL.
        </p>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="space-y-1">
            <Label>Hostname</Label>
            <Input value={hostname} onChange={(e) => setHostname(e.target.value)} placeholder="mulugu.telangana.gov.in" />
          </div>
          <div className="space-y-1">
            <Label>Municipality</Label>
            <Select value={ulbId} onValueChange={setUlbId}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                {ulbs.map((u) => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end"><Button onClick={add}>Add domain</Button></div>
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="font-display font-bold mb-3">Mapped domains ({rows.length})</h3>
        {rows.length === 0 && <p className="text-sm text-muted-foreground">No domains mapped yet.</p>}
        <ul className="divide-y">
          {rows.map((r) => (
            <li key={r.id} className="flex items-center justify-between py-2">
              <span className="text-sm"><strong>{r.hostname}</strong> → {nameById.get(r.ulb_id) ?? r.ulb_id}</span>
              <Button size="icon" variant="ghost" onClick={() => remove(r.id)}><Trash2 className="h-4 w-4" /></Button>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
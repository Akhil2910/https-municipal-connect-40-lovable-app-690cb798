import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, X } from "lucide-react";

export type FieldDef = {
  name: string;
  label: string;
  type: "text" | "textarea" | "number" | "boolean" | "date";
  required?: boolean;
  default?: string | number | boolean;
};

type Props = {
  table: string;
  ulbId: string;
  fields: FieldDef[];
  title: string;
};

export function CrudSection({ table, ulbId, fields, title }: Props) {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [showForm, setShowForm] = useState(false);

  async function load() {
    if (!ulbId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from(table as any).select("*").eq("ulb_id", ulbId).order("created_at", { ascending: false });
    setLoading(false);
    if (error) return toast.error(error.message);
    setRows((data ?? []) as any[]);
  }
  useEffect(() => { load(); }, [table, ulbId]);

  function startNew() {
    const init: any = { ulb_id: ulbId };
    for (const f of fields) if (f.default !== undefined) init[f.name] = f.default;
    setEditing(init);
    setShowForm(true);
  }
  function startEdit(row: any) {
    setEditing({ ...row });
    setShowForm(true);
  }
  function cancel() { setEditing(null); setShowForm(false); }

  async function save() {
    if (!editing) return;
    const payload: any = { ...editing, ulb_id: ulbId };
    for (const f of fields) {
      if (f.type === "number" && payload[f.name] !== undefined && payload[f.name] !== "") {
        payload[f.name] = Number(payload[f.name]);
      }
      if (payload[f.name] === "") payload[f.name] = null;
    }
    const { id, created_at, updated_at, ...rest } = payload;
    const op = id
      ? supabase.from(table as any).update(rest).eq("id", id)
      : supabase.from(table as any).insert(rest);
    const { error } = await op;
    if (error) return toast.error(error.message);
    toast.success("Saved");
    cancel(); load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this item?")) return;
    const { error } = await supabase.from(table as any).delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted"); load();
  }

  return (
    <div className="mt-4 grid gap-4">
      <div className="flex justify-between items-center">
        <h2 className="font-display text-xl font-bold text-gov-navy">{title}</h2>
        <Button onClick={startNew} disabled={!ulbId}><Plus className="w-4 h-4 mr-1" />Add new</Button>
      </div>

      {showForm && editing && (
        <Card className="p-4 grid gap-3">
          <div className="flex justify-between items-center">
            <h3 className="font-bold">{editing.id ? "Edit" : "New"} {title}</h3>
            <Button size="icon" variant="ghost" onClick={cancel}><X className="w-4 h-4" /></Button>
          </div>
          {fields.map((f) => (
            <div key={f.name} className="grid gap-1.5">
              <Label>{f.label}{f.required && " *"}</Label>
              {f.type === "textarea" ? (
                <Textarea rows={4} value={editing[f.name] ?? ""} onChange={(e) => setEditing({ ...editing, [f.name]: e.target.value })} />
              ) : f.type === "boolean" ? (
                <Switch checked={!!editing[f.name]} onCheckedChange={(v) => setEditing({ ...editing, [f.name]: v })} />
              ) : (
                <Input
                  type={f.type === "number" ? "number" : f.type === "date" ? "date" : "text"}
                  value={editing[f.name] ?? ""}
                  onChange={(e) => setEditing({ ...editing, [f.name]: e.target.value })}
                />
              )}
            </div>
          ))}
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={cancel}>Cancel</Button>
            <Button onClick={save}>Save</Button>
          </div>
        </Card>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No items yet.</p>
      ) : (
        <div className="grid gap-2">
          {rows.map((r) => (
            <Card key={r.id} className="p-3 flex justify-between items-start gap-3">
              <div className="min-w-0 flex-1">
                <div className="font-semibold truncate">{r.title || r.name || r.caption || r.image_url || r.id}</div>
                <div className="text-xs text-muted-foreground truncate">
                  {r.summary || r.description || r.short_description || r.role || r.category || ""}
                </div>
              </div>
              <div className="flex gap-1 shrink-0">
                <Button size="icon" variant="ghost" onClick={() => startEdit(r)}><Pencil className="w-4 h-4" /></Button>
                <Button size="icon" variant="ghost" onClick={() => remove(r.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
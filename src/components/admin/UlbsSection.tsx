import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, X } from "lucide-react";

const FIELDS: { name: string; label: string; type: "text" | "textarea" | "number" | "boolean" | "image" }[] = [
  { name: "name", label: "Name", type: "text" },
  { name: "slug", label: "Slug (URL)", type: "text" },
  { name: "type", label: "Type", type: "text" },
  { name: "code", label: "Code", type: "text" },
  { name: "district", label: "District", type: "text" },
  { name: "state", label: "State", type: "text" },
  { name: "population", label: "Population", type: "number" },
  { name: "established_year", label: "Established Year", type: "number" },
  { name: "area_sqkm", label: "Area (sq km)", type: "number" },
  { name: "website", label: "Website", type: "text" },
  { name: "email", label: "Email", type: "text" },
  { name: "phone", label: "Phone", type: "text" },
  { name: "address", label: "Address", type: "textarea" },
  { name: "mission", label: "Mission", type: "textarea" },
  { name: "vision", label: "Vision", type: "textarea" },
  { name: "about", label: "About", type: "textarea" },
  { name: "hero_image_url", label: "Hero Image", type: "image" },
  { name: "logo_url", label: "Logo", type: "image" },
  { name: "primary_color", label: "Primary Color", type: "text" },
  { name: "is_active", label: "Active", type: "boolean" },
];

export function UlbsSection() {
  const [rows, setRows] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | null>(null);

  async function load() {
    const { data, error } = await supabase.from("ulbs").select("*").order("name");
    if (error) return toast.error(error.message);
    setRows(data ?? []);
  }
  useEffect(() => { load(); }, []);

  async function save() {
    if (!editing) return;
    const payload: any = { ...editing };
    for (const f of FIELDS) {
      if (f.type === "number" && payload[f.name] !== undefined && payload[f.name] !== "") payload[f.name] = Number(payload[f.name]);
      if (payload[f.name] === "") payload[f.name] = null;
    }
    const { id, created_at, updated_at, ...rest } = payload;
    const op = id ? supabase.from("ulbs").update(rest).eq("id", id) : supabase.from("ulbs").insert(rest);
    const { error } = await op;
    if (error) return toast.error(error.message);
    toast.success("Saved"); setEditing(null); load();
  }
  async function remove(id: string) {
    if (!confirm("Delete this ULB? This will also remove all its content.")) return;
    const { error } = await supabase.from("ulbs").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted"); load();
  }

  return (
    <div className="mt-4 grid gap-4">
      <div className="flex justify-between items-center">
        <h2 className="font-display text-xl font-bold text-gov-navy">Municipalities (ULBs)</h2>
        <Button onClick={() => setEditing({ is_active: true, type: "Municipality", state: "Telangana" })}>
          <Plus className="w-4 h-4 mr-1" />Add ULB
        </Button>
      </div>

      {editing && (
        <Card className="p-4 grid gap-3">
          <div className="flex justify-between items-center">
            <h3 className="font-bold">{editing.id ? "Edit" : "New"} ULB</h3>
            <Button size="icon" variant="ghost" onClick={() => setEditing(null)}><X className="w-4 h-4" /></Button>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            {FIELDS.map((f) => (
              <div key={f.name} className="grid gap-1.5">
                <Label>{f.label}</Label>
                {f.type === "textarea" ? (
                  <Textarea rows={3} value={editing[f.name] ?? ""} onChange={(e) => setEditing({ ...editing, [f.name]: e.target.value })} />
                ) : f.type === "boolean" ? (
                  <Switch checked={!!editing[f.name]} onCheckedChange={(v) => setEditing({ ...editing, [f.name]: v })} />
                ) : f.type === "image" ? (
                  <div className="grid gap-2">
                    {editing[f.name] && (
                      <img src={editing[f.name]} alt="" className="max-h-32 w-auto rounded border" />
                    )}
                    <Input type="file" accept="image/*" onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const path = `ulbs/${editing.slug || 'new'}/${f.name}-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
                      const up = await supabase.storage.from('public-assets').upload(path, file, { upsert: true });
                      if (up.error) { toast.error(up.error.message); return; }
                      const { data: signed, error: sErr } = await supabase.storage.from('public-assets')
                        .createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
                      if (sErr || !signed) { toast.error(sErr?.message ?? 'Failed to sign URL'); return; }
                      setEditing({ ...editing, [f.name]: signed.signedUrl });
                      toast.success('Uploaded');
                    }} />
                    <Input placeholder="or paste URL" value={editing[f.name] ?? ""}
                      onChange={(e) => setEditing({ ...editing, [f.name]: e.target.value })} />
                  </div>
                ) : (
                  <Input type={f.type === "number" ? "number" : "text"} value={editing[f.name] ?? ""} onChange={(e) => setEditing({ ...editing, [f.name]: e.target.value })} />
                )}
              </div>
            ))}
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={save}>Save</Button>
          </div>
        </Card>
      )}

      <div className="grid gap-2">
        {rows.map((r) => (
          <Card key={r.id} className="p-3 flex justify-between items-center gap-3">
            <div className="min-w-0">
              <div className="font-semibold">{r.name}</div>
              <div className="text-xs text-muted-foreground">/{r.slug} · {r.district || "—"} · {r.is_active ? "Active" : "Hidden"}</div>
            </div>
            <div className="flex gap-1">
              <Button size="icon" variant="ghost" onClick={() => setEditing({ ...r })}><Pencil className="w-4 h-4" /></Button>
              <Button size="icon" variant="ghost" onClick={() => remove(r.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
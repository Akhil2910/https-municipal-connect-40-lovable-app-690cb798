import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const FIELDS: { name: string; label: string; type: "text" | "textarea" | "number" | "image" }[] = [
  { name: "name", label: "Municipality name", type: "text" },
  { name: "district", label: "District", type: "text" },
  { name: "population", label: "Population", type: "number" },
  { name: "established_year", label: "Established year", type: "number" },
  { name: "area_sqkm", label: "Area (sq km)", type: "number" },
  { name: "phone", label: "Phone", type: "text" },
  { name: "email", label: "Email", type: "text" },
  { name: "address", label: "Office address", type: "textarea" },
  { name: "about", label: "About the municipality", type: "textarea" },
  { name: "vision", label: "Vision", type: "textarea" },
  { name: "mission", label: "Mission", type: "textarea" },
  { name: "hero_image_url", label: "Main home page picture", type: "image" },
  { name: "logo_url", label: "Logo", type: "image" },
];

/** Edits the home page / profile details of the selected municipality. */
export function HomeDetailsSection({ ulbId }: { ulbId: string }) {
  const [row, setRow] = useState<any | null>(null);

  useEffect(() => {
    if (!ulbId) return;
    setRow(null);
    supabase.from("ulbs").select("*").eq("id", ulbId).single().then(({ data, error }) => {
      if (error) toast.error(error.message);
      setRow(data);
    });
  }, [ulbId]);

  async function upload(name: string, file: File) {
    const path = `ulbs/${ulbId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const up = await supabase.storage.from("public-assets").upload(path, file, { upsert: true });
    if (up.error) return toast.error(up.error.message);
    const { data } = await supabase.storage.from("public-assets").createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
    if (!data) return toast.error("Upload failed");
    setRow((r: any) => ({ ...r, [name]: data.signedUrl }));
    toast.success("Picture uploaded — click Save");
  }

  async function save() {
    const payload: any = {};
    for (const f of FIELDS) {
      let v = row[f.name];
      if (v === "") v = null;
      if (f.type === "number" && v != null) v = Number(v);
      payload[f.name] = v;
    }
    const { error } = await supabase.from("ulbs").update(payload).eq("id", ulbId);
    if (error) return toast.error(error.message);
    toast.success("Saved");
  }

  if (!row) return <p className="mt-4 text-sm text-muted-foreground">Loading…</p>;

  return (
    <Card className="mt-4 p-4 grid gap-3">
      <h2 className="font-display text-xl font-bold text-gov-navy">Home Page Details</h2>
      {FIELDS.map((f) => (
        <div key={f.name} className="grid gap-1.5">
          <Label>{f.label}</Label>
          {f.type === "textarea" ? (
            <Textarea rows={4} value={row[f.name] ?? ""} onChange={(e) => setRow({ ...row, [f.name]: e.target.value })} />
          ) : f.type === "image" ? (
            <div className="grid gap-2">
              {row[f.name] && <img src={row[f.name]} alt="" className="max-h-40 w-auto rounded border" />}
              <Input type="file" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; if (file) upload(f.name, file); }} />
            </div>
          ) : (
            <Input type={f.type === "number" ? "number" : "text"} value={row[f.name] ?? ""} onChange={(e) => setRow({ ...row, [f.name]: e.target.value })} />
          )}
        </div>
      ))}
      <div className="flex justify-end"><Button onClick={save}>Save</Button></div>
    </Card>
  );
}

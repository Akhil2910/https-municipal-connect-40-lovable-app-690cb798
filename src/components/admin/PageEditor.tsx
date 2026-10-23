import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

type Props = { ulbId: string; pageKey: string; title: string; help?: string };

/** Edits one fixed website page (no slug typing needed by staff). */
export function PageEditor({ ulbId, pageKey, title, help }: Props) {
  const [row, setRow] = useState<any>({ title: "", body: "", image_url: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!ulbId) return;
    setLoading(true);
    supabase.from("pages").select("*").eq("ulb_id", ulbId).eq("slug", pageKey).maybeSingle()
      .then(({ data }) => {
        setRow(data ?? { title: "", body: "", image_url: "" });
        setLoading(false);
      });
  }, [ulbId, pageKey]);

  async function upload(file: File) {
    const path = `pages/${ulbId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const up = await supabase.storage.from("public-assets").upload(path, file, { upsert: true });
    if (up.error) return toast.error(up.error.message);
    const { data } = await supabase.storage.from("public-assets").createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
    if (!data) return toast.error("Upload failed");
    setRow({ ...row, image_url: data.signedUrl });
    toast.success("Picture uploaded — click Save");
  }

  async function save() {
    const payload = { ulb_id: ulbId, slug: pageKey, title: row.title || null, body: row.body || null, image_url: row.image_url || null };
    const { error } = row.id
      ? await supabase.from("pages").update(payload).eq("id", row.id)
      : await supabase.from("pages").insert(payload);
    if (error) return toast.error(error.message);
    toast.success("Saved");
    const { data } = await supabase.from("pages").select("*").eq("ulb_id", ulbId).eq("slug", pageKey).maybeSingle();
    if (data) setRow(data);
  }

  if (loading) return <p className="mt-4 text-sm text-muted-foreground">Loading…</p>;

  return (
    <Card className="mt-4 p-4 grid gap-3">
      <h2 className="font-display text-xl font-bold text-gov-navy">{title}</h2>
      {help && <p className="text-sm text-muted-foreground">{help}</p>}
      <div className="grid gap-1.5">
        <Label>Heading</Label>
        <Input value={row.title ?? ""} onChange={(e) => setRow({ ...row, title: e.target.value })} />
      </div>
      <div className="grid gap-1.5">
        <Label>Text</Label>
        <Textarea rows={8} value={row.body ?? ""} onChange={(e) => setRow({ ...row, body: e.target.value })} />
      </div>
      <div className="grid gap-2">
        <Label>Picture</Label>
        {row.image_url && <img src={row.image_url} alt="" className="max-h-56 w-auto rounded border" />}
        <Input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); }} />
        {row.image_url && (
          <Button variant="ghost" className="justify-self-start" onClick={() => setRow({ ...row, image_url: "" })}>Remove picture</Button>
        )}
      </div>
      <div className="flex justify-end"><Button onClick={save}>Save</Button></div>
    </Card>
  );
}

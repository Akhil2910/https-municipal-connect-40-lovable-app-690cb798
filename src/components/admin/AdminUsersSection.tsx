import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { createUlbAdmin, deleteUlbAdmin, listUlbAdmins } from "@/lib/admin-users.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

type Row = { id: string; user_id: string; ulb_id: string; label: string | null; email: string };

export function AdminUsersSection({ ulbs }: { ulbs: { id: string; name: string; slug: string }[] }) {
  const list = useServerFn(listUlbAdmins);
  const create = useServerFn(createUlbAdmin);
  const remove = useServerFn(deleteUlbAdmin);

  const [rows, setRows] = useState<Row[]>([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [ulbId, setUlbId] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    try {
      const res: any = await list();
      const arr = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
      setRows(arr as Row[]);
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to load admins");
    }
  }
  useEffect(() => { load(); }, []);

  async function add() {
    if (!email || password.length < 8 || !ulbId) {
      return toast.error("Email, a password of 8+ characters and a municipality are required");
    }
    setBusy(true);
    try {
      await create({ data: { email: email.trim(), password, ulbId } });
      toast.success("Municipality admin saved");
      setEmail(""); setPassword("");
      load();
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to save admin");
    } finally {
      setBusy(false);
    }
  }

  async function del(id: string) {
    if (!confirm("Remove this admin's access?")) return;
    try {
      await remove({ data: { id } });
      load();
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to remove");
    }
  }

  const nameById = new Map(ulbs.map((u) => [u.id, u.name]));

  return (
    <div className="space-y-4 py-4">
      <Card className="p-4 space-y-3">
        <h3 className="font-display font-bold">Create a municipality admin</h3>
        <p className="text-sm text-muted-foreground">
          A municipality admin signs in at /admin/login and can edit only their own municipality's content.
        </p>
        <div className="grid gap-3 md:grid-cols-4">
          <div className="space-y-1">
            <Label>Email</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="mulugu@portal.local" />
          </div>
          <div className="space-y-1">
            <Label>Password</Label>
            <Input type="text" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="min 8 characters" />
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
          <div className="flex items-end"><Button onClick={add} disabled={busy}>{busy ? "Saving…" : "Save admin"}</Button></div>
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="font-display font-bold mb-3">Municipality admins ({rows.length})</h3>
        {rows.length === 0 && <p className="text-sm text-muted-foreground">No municipality admins yet.</p>}
        <ul className="divide-y">
          {rows.map((r) => (
            <li key={r.id} className="flex items-center justify-between py-2">
              <span className="text-sm"><strong>{r.email}</strong> → {nameById.get(r.ulb_id) ?? r.ulb_id}</span>
              <Button size="icon" variant="ghost" onClick={() => del(r.id)}><Trash2 className="h-4 w-4" /></Button>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { resetUserPassword } from "@/lib/admin-users.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

/** Signed-in user changes their own password (current password required). */
export function ChangePasswordButton({ email }: { email: string }) {
  const [open, setOpen] = useState(false);
  const [cur, setCur] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (pw.length < 8) return toast.error("New password must be at least 8 characters");
    if (pw !== pw2) return toast.error("New passwords do not match");
    setBusy(true);
    const check = await supabase.auth.signInWithPassword({ email, password: cur });
    if (check.error) { setBusy(false); return toast.error("Current password is wrong"); }
    const { error } = await supabase.auth.updateUser({ password: pw, current_password: cur } as any);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Password changed");
    setOpen(false); setCur(""); setPw(""); setPw2("");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button variant="secondary">Change password</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Change password</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="grid gap-3">
          <div className="grid gap-1.5"><Label>Current password</Label><Input type="password" required value={cur} onChange={(e) => setCur(e.target.value)} /></div>
          <div className="grid gap-1.5"><Label>New password</Label><Input type="password" required value={pw} onChange={(e) => setPw(e.target.value)} /></div>
          <div className="grid gap-1.5"><Label>Repeat new password</Label><Input type="password" required value={pw2} onChange={(e) => setPw2(e.target.value)} /></div>
          <Button type="submit" disabled={busy}>{busy ? "Saving…" : "Save new password"}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/** Super admin resets a forgotten password for any admin account. */
export function ResetPasswordCard() {
  const reset = useServerFn(resetUserPassword);
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await reset({ data: { email, password: pw } });
      toast.success(`Password reset for ${email}`);
      setEmail(""); setPw("");
    } catch (err: any) {
      toast.error(err?.message ?? "Reset failed");
    } finally { setBusy(false); }
  }

  return (
    <Card className="mt-4 p-4">
      <h3 className="font-bold text-gov-navy">Reset a forgotten password</h3>
      <p className="text-sm text-muted-foreground">Set a new password for any admin or super admin account.</p>
      <form onSubmit={submit} className="grid sm:grid-cols-3 gap-3 mt-3 items-end">
        <div className="grid gap-1.5"><Label>Login email</Label><Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="muluguadmin@portal.local" /></div>
        <div className="grid gap-1.5"><Label>New password (min 8)</Label><Input type="text" required minLength={8} value={pw} onChange={(e) => setPw(e.target.value)} /></div>
        <Button type="submit" disabled={busy}>{busy ? "Resetting…" : "Reset password"}</Button>
      </form>
    </Card>
  );
}

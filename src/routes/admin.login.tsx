import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/login")({
  component: Login,
});

function Login() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: String(fd.get("email")), password: String(fd.get("password")),
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    nav({ to: "/admin" });
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-gov-cream p-4">
      <form onSubmit={onSubmit} className="bg-card border rounded-xl p-8 w-full max-w-md shadow-[var(--shadow-elegant)]">
        <h1 className="font-display text-2xl font-black text-gov-navy">Admin Login</h1>
        <p className="text-sm text-muted-foreground">Telangana ULB Portal · Super Admin only</p>
        <div className="grid gap-4 mt-6">
          <input name="email" type="email" required placeholder="Email" className="border rounded-md px-3 py-2" />
          <input name="password" type="password" required placeholder="Password" className="border rounded-md px-3 py-2" />
          <button disabled={loading} className="bg-gov-green text-primary-foreground rounded-md py-3 font-bold disabled:opacity-50">
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-4">
          First-time setup: create an account in <strong>Lovable Cloud → Users</strong>, then assign the <code>super_admin</code> role in the <code>user_roles</code> table.
        </p>
      </form>
    </div>
  );
}
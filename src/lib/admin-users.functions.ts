import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

async function assertSuperAdmin(context: any) {
  const { data, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "super_admin",
  });
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden: super admin only");
}

export const listUlbAdmins = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertSuperAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin
      .from("ulb_admins")
      .select("id,user_id,ulb_id,label,created_at")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);

    const { data: users } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    const emailById = new Map((users?.users ?? []).map((u) => [u.id, u.email ?? ""]));
    return (rows ?? []).map((r) => ({ ...r, email: emailById.get(r.user_id) ?? "(unknown)" }));
  });

export const createUlbAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        email: z.string().email(),
        password: z.string().min(8).max(72),
        ulbId: z.string().uuid(),
        label: z.string().max(120).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Reuse an existing account with the same email when present.
    const { data: existing } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    let userId = existing?.users.find((u) => u.email?.toLowerCase() === data.email.toLowerCase())?.id;

    if (!userId) {
      const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
        email: data.email,
        password: data.password,
        email_confirm: true,
      });
      if (error) throw new Error(error.message);
      userId = created.user.id;
    } else {
      const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, { password: data.password });
      if (error) throw new Error(error.message);
    }

    const { error: mapError } = await supabaseAdmin
      .from("ulb_admins")
      .upsert({ user_id: userId, ulb_id: data.ulbId, label: data.label ?? null }, { onConflict: "user_id,ulb_id" });
    if (mapError) throw new Error(mapError.message);

    return { ok: true, userId };
  });

export const deleteUlbAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("ulb_admins").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
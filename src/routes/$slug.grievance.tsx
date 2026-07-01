import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useUlb } from "./$slug";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { toast } from "sonner";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/$slug/grievance")({
  head: () => ({ meta: [{ title: "Lodge a Grievance" }] }),
  component: GrievancePage,
});

const CATEGORIES = [
  "Sanitation & Garbage",
  "Water Supply",
  "Street Lights",
  "Roads & Potholes",
  "Drainage",
  "Property Tax",
  "Trade Licence",
  "Building Permission",
  "Stray Animals",
  "Encroachment",
  "Other",
];

const schema = z.object({
  citizen_name: z.string().trim().min(2, "Name is required").max(100),
  phone: z.string().trim().regex(/^[0-9]{10}$/, "Enter a valid 10-digit phone"),
  email: z.string().trim().email("Invalid email").max(255).optional().or(z.literal("")),
  category: z.string().min(1, "Select a category"),
  description: z.string().trim().min(10, "Describe your complaint (min 10 chars)").max(1000),
  address: z.string().trim().max(300).optional().or(z.literal("")),
});

function GrievancePage() {
  const ulb = useUlb();
  const [form, setForm] = useState({
    citizen_name: "", phone: "", email: "", category: "", description: "", address: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [ticket, setTicket] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    setSubmitting(true);
    const { data, error } = await supabase
      .from("grievances")
      .insert({
        ulb_id: ulb.id,
        citizen_name: parsed.data.citizen_name,
        phone: parsed.data.phone,
        email: parsed.data.email || null,
        category: parsed.data.category,
        description: parsed.data.description,
        address: parsed.data.address || null,
      })
      .select("ticket_no")
      .single();
    setSubmitting(false);
    if (error) return toast.error(error.message);
    setTicket(data!.ticket_no);
    setForm({ citizen_name: "", phone: "", email: "", category: "", description: "", address: "" });
    toast.success("Grievance submitted");
  }

  return (
    <section className="container mx-auto px-4 py-14 max-w-3xl">
      <div className="text-center mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-accent">Citizen Voice</p>
        <h1 className="font-display text-3xl md:text-4xl font-black text-gov-navy mt-2 flex items-center justify-center gap-2">
          <AlertCircle className="h-7 w-7 text-gov-saffron" /> Lodge a Grievance
        </h1>
        <div className="mx-auto mt-3 h-1 w-20 bg-gradient-to-r from-gov-saffron via-white to-gov-green rounded-full" />
        <p className="text-sm text-muted-foreground mt-3">
          Report civic issues to {ulb.name} {ulb.type ?? "Municipality"}. You will receive a ticket number to track your complaint.
        </p>
      </div>

      {ticket && (
        <div className="mb-6 border-2 border-gov-green bg-gov-green/10 text-gov-navy rounded-lg p-4 flex gap-3 items-start">
          <CheckCircle2 className="h-6 w-6 text-gov-green shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Grievance submitted successfully</p>
            <p className="text-sm">Your ticket number is <span className="font-mono font-bold">{ticket}</span>. Please save it for future reference.</p>
          </div>
        </div>
      )}

      <form onSubmit={submit} className="bg-card border rounded-xl p-6 grid gap-4 shadow-sm">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="citizen_name">Full Name *</Label>
            <Input id="citizen_name" value={form.citizen_name} maxLength={100}
              onChange={(e) => setForm({ ...form, citizen_name: e.target.value })} required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="phone">Phone (10 digits) *</Label>
            <Input id="phone" inputMode="numeric" maxLength={10} value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, "") })} required />
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email (optional)</Label>
            <Input id="email" type="email" value={form.email} maxLength={255}
              onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="grid gap-2">
            <Label>Category *</Label>
            <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
              <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="address">Location / Address (optional)</Label>
          <Input id="address" value={form.address} maxLength={300}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            placeholder="Street, ward, landmark…" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="description">Describe your complaint *</Label>
          <Textarea id="description" rows={5} maxLength={1000} value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })} required />
          <p className="text-xs text-muted-foreground text-right">{form.description.length}/1000</p>
        </div>
        <div className="flex justify-end">
          <Button type="submit" disabled={submitting} className="bg-gov-green hover:bg-gov-green/90">
            {submitting ? "Submitting…" : "Submit Grievance"}
          </Button>
        </div>
      </form>
    </section>
  );
}
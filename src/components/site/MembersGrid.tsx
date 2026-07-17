import { Phone, Mail, User } from "lucide-react";

export type MemberLike = {
  id: string;
  name: string;
  ward?: string | null;
  designation?: string | null;
  constituency?: string | null;
  phone?: string | null;
  email?: string | null;
  photo_url?: string | null;
};

export function MembersGrid({ members, emptyLabel }: { members: MemberLike[]; emptyLabel: string }) {
  if (!members.length) {
    return (
      <div className="mt-6 bg-card border rounded-lg p-6 text-sm text-muted-foreground">
        {emptyLabel}
      </div>
    );
  }
  return (
    <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {members.map((m) => (
        <div key={m.id} className="bg-card border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition">
          <div className="aspect-[4/3] bg-gov-cream flex items-center justify-center overflow-hidden">
            {m.photo_url ? (
              <img src={m.photo_url} alt={m.name} className="h-full w-full object-cover" />
            ) : (
              <User className="h-16 w-16 text-muted-foreground/40" />
            )}
          </div>
          <div className="p-4">
            <h3 className="font-bold text-gov-navy">{m.name}</h3>
            {(m.designation || m.ward || m.constituency) && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {[m.designation, m.ward && `Ward ${m.ward}`, m.constituency].filter(Boolean).join(" · ")}
              </p>
            )}
            <div className="mt-3 space-y-1 text-sm">
              {m.phone && (
                <a href={`tel:${m.phone}`} className="flex items-center gap-2 text-gov-green hover:underline">
                  <Phone className="h-3.5 w-3.5" /> {m.phone}
                </a>
              )}
              {m.email && (
                <a href={`mailto:${m.email}`} className="flex items-center gap-2 text-gov-green hover:underline truncate">
                  <Mail className="h-3.5 w-3.5 shrink-0" /> <span className="truncate">{m.email}</span>
                </a>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
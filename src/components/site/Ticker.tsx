import type { Notice } from "@/lib/ulb-types";
import { Megaphone } from "lucide-react";

export function Ticker({ notices }: { notices: Pick<Notice, "id" | "title">[] }) {
  if (!notices.length) return null;
  const items = [...notices, ...notices];
  return (
    <div className="bg-accent/10 border-y border-accent/30 overflow-hidden">
      <div className="container mx-auto flex items-center gap-3 px-4 py-2">
        <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent shrink-0">
          <Megaphone className="h-4 w-4" /> Latest
        </span>
        <div className="overflow-hidden flex-1">
          <div className="animate-marquee flex gap-12 whitespace-nowrap text-sm">
            {items.map((n, i) => (
              <span key={`${n.id}-${i}`} className="text-foreground/80">• {n.title}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
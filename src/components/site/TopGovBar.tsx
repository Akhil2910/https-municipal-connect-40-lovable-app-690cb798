import { Link } from "@tanstack/react-router";

export function TopGovBar({ ulbName }: { ulbName?: string }) {
  return (
    <div className="bg-gov-navy text-primary-foreground text-xs">
      <div className="container mx-auto flex flex-wrap items-center justify-between gap-2 px-4 py-1.5">
        <span className="opacity-90">
          Government of Telangana · {ulbName ?? "Urban Local Bodies"}
        </span>
        <div className="flex items-center gap-4 opacity-90">
          <Link to="/" className="hover:underline">All Municipalities</Link>
          <a href="#main" className="hover:underline">Skip to content</a>
          <Link to="/admin/login" className="hover:underline">Staff Login</Link>
        </div>
      </div>
      <div className="gov-tricolor-bar" />
    </div>
  );
}
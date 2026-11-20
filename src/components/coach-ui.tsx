import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  BookOpen,
  Home,
  MessageSquare,
  Search,
  Shield,
} from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import logo from "@/img/logo.png";
import { asset, cn } from "@/lib/utils";
import { initials } from "@/lib/format";
import { useCoach } from "@/lib/store";

const TABS = [
  { id: "home", to: "/home", label: "Home", es: "Inicio", icon: Home },
  { id: "teams", to: "/teams", label: "Teams", es: "Equipos", icon: Shield },
  { id: "recruit", to: "/recruit", label: "Recruit", es: "Reclutar", icon: Search },
  { id: "learn", to: "/learn", label: "Learn", es: "Aprender", icon: BookOpen },
  { id: "chat", to: "/chat", label: "Chat", es: "Chat", icon: MessageSquare },
] as const;

export function Logo({ className, wide = false }: { className?: string; wide?: boolean }) {
  return (
    <img src={logo} alt="SpotMyRoster" className={cn("w-auto", wide ? "h-16" : "h-8", className)} />
  );
}

export function BootScreen() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-6">
      <Logo wide />
    </div>
  );
}

export function useOnline() {
  const [online, setOnline] = useState(true);
  useEffect(() => {
    setOnline(navigator.onLine);
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);
  return online;
}

function tabId(path: string) {
  if (path.startsWith("/teams") || path.startsWith("/needs")) return "teams";
  if (path.startsWith("/recruit")) return "recruit";
  if (path.startsWith("/learn")) return "learn";
  if (path.startsWith("/chat")) return "chat";
  if (path.startsWith("/home")) return "home";
  return "";
}

export function AppFrame({ children, hideTabs = false }: { children: ReactNode; hideTabs?: boolean }) {
  const { ready, user } = useCoach();
  const navigate = useNavigate();
  const online = useOnline();
  const path = useRouterState({ select: (state) => state.location.pathname });

  useEffect(() => {
    if (!ready) return;
    if (!user) navigate({ to: "/login", replace: true });
    else if (!user.emailVerified) {
      navigate({ to: "/otp", search: { purpose: "verify", email: user.email }, replace: true });
    } else if (!user.profileComplete) navigate({ to: "/setup", replace: true });
  }, [ready, user, navigate]);

  if (!ready || !user?.profileComplete || !user.emailVerified) return <BootScreen />;

  return (
    <div className={cn("min-h-dvh bg-background", !hideTabs && "pb-[calc(4.75rem+env(safe-area-inset-bottom))]")}>
      {!online && (
        <p className="bg-warning px-4 py-2 text-center type-small text-warning-foreground" role="status">
          You're offline. Changes stay on this device.
        </p>
      )}
      {children}
      {!hideTabs && <TabBar path={path} language={user.language} />}
    </div>
  );
}

function TabBar({ path, language }: { path: string; language: "en" | "es" }) {
  const active = tabId(path);
  return (
    <nav
      aria-label="Primary"
      className="fixed bottom-0 left-1/2 z-40 w-full max-w-[480px] -translate-x-1/2 border-t border-border bg-background/95 backdrop-blur"
    >
      <ul className="grid grid-cols-5 px-1 pb-[max(0.4rem,env(safe-area-inset-bottom))] pt-1">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const selected = active === tab.id;
          const label = language === "es" ? tab.es : tab.label;
          return (
            <li key={tab.id}>
              <Link
                to={tab.to}
                aria-current={selected ? "page" : undefined}
                className={cn(
                  "flex min-h-11 flex-col items-center justify-center gap-0.5 rounded-xl text-[11px] font-semibold",
                  selected ? "text-foreground" : "text-dim",
                )}
              >
                <span
                  className={cn(
                    "flex h-7 min-w-7 items-center justify-center rounded-full px-2",
                    selected && "bg-primary text-primary-foreground",
                  )}
                >
                  <Icon size={18} strokeWidth={2} aria-hidden />
                </span>
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function PersonAvatar({
  name,
  src,
  size = 40,
}: {
  name: string;
  src?: string;
  size?: number;
}) {
  if (src) {
    return <img src={src} alt="" className="rounded-full object-cover" style={{ width: size, height: size }} />;
  }
  return (
    <span
      aria-hidden
      className="inline-flex items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground"
      style={{ width: size, height: size, fontSize: size < 36 ? 11 : 13 }}
    >
      {initials(name)}
    </span>
  );
}

const BADGE: Record<string, string> = {
  New: "bg-primary text-primary-foreground",
  Pending: "bg-warning text-warning-foreground",
  Accepted: "bg-success text-success-foreground",
  Declined: "bg-danger text-danger-foreground",
  Verified: "bg-success text-success-foreground",
  Open: "bg-primary text-primary-foreground",
  Filled: "bg-success text-success-foreground",
  Closed: "bg-muted text-muted-foreground",
  Shortlisted: "bg-muted text-foreground",
  Invited: "bg-primary text-primary-foreground",
  Tryout: "bg-warning text-warning-foreground",
  Offered: "bg-warning text-warning-foreground",
  Scheduled: "bg-primary text-primary-foreground",
  Showcase: "bg-muted text-foreground",
  Practice: "bg-muted text-foreground",
  Tournament: "bg-muted text-foreground",
  Cancelled: "bg-danger text-danger-foreground",
  Active: "bg-success text-success-foreground",
  Paused: "bg-warning text-warning-foreground",
  Paid: "bg-success text-success-foreground",
  Failed: "bg-danger text-danger-foreground",
  Boosted: "bg-primary text-primary-foreground",
  Going: "bg-success text-success-foreground",
  Waitlist: "bg-warning text-warning-foreground",
  "Not going": "bg-muted text-muted-foreground",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn("type-caption inline-flex rounded-full px-2 py-1 normal-case tracking-normal", BADGE[status] ?? "bg-muted text-foreground")}>
      {status}
    </span>
  );
}

export function SectionHead({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="mb-3 mt-8 flex items-end justify-between gap-3 first:mt-0">
      <h2 className="type-section text-foreground">{title}</h2>
      {action}
    </div>
  );
}

export function TextLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link to={to as "/"} className="type-small font-semibold text-foreground underline underline-offset-2">
      {children}
    </Link>
  );
}

export function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
      <div className="h-full rounded-full bg-primary" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-xl bg-muted", className)} aria-hidden />;
}

export function EmptyState({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card px-5 py-8 text-center">
      <img src={asset("/images/empty-states/empty-roster.jpg")} alt="" className="mx-auto mb-4 h-28 w-28 rounded-2xl object-cover" />
      <h3 className="type-section text-foreground">{title}</h3>
      <p className="mx-auto mt-2 max-w-xs type-small text-muted-foreground">{body}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorState({ title, body, onRetry }: { title: string; body: string; onRetry?: () => void }) {
  return (
    <div className="rounded-2xl border border-danger/40 bg-card px-5 py-8 text-center" role="alert">
      <h3 className="type-section text-foreground">{title}</h3>
      <p className="mx-auto mt-2 max-w-xs type-small text-muted-foreground">{body}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="mt-4 min-h-11 rounded-xl bg-primary px-4 font-semibold text-primary-foreground">
          Try again
        </button>
      )}
    </div>
  );
}

export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel,
  danger,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  danger?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (open) cancelRef.current?.focus();
  }, [open]);
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/70 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:items-center" role="presentation" onClick={onClose}>
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-body"
        className="w-full max-w-[440px] rounded-2xl border border-border bg-card p-5"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="confirm-title" className="type-title text-foreground">{title}</h2>
        <p id="confirm-body" className="mt-2 type-body text-muted-foreground">{body}</p>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button ref={cancelRef} type="button" onClick={onClose} className="min-h-11 rounded-xl border border-border bg-background font-semibold text-foreground">
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={cn("min-h-11 rounded-xl font-semibold", danger ? "bg-danger text-danger-foreground" : "bg-primary text-primary-foreground")}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export function Sheet({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/70" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="max-h-[85dvh] w-full max-w-[480px] overflow-y-auto rounded-t-3xl border-t border-border bg-card p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="type-title text-foreground">{title}</h2>
          <button type="button" onClick={onClose} className="min-h-11 min-w-11 rounded-xl text-foreground" aria-label="Close">
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Segmented({
  value,
  options,
  onChange,
}: {
  value: string;
  options: { id: string; label: string }[];
  onChange: (id: string) => void;
}) {
  return (
    <div className="grid rounded-xl bg-muted p-1" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }} role="tablist">
      {options.map((option) => {
        const selected = option.id === value;
        return (
          <button
            key={option.id}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(option.id)}
            className={cn(
              "min-h-10 rounded-lg px-2 text-sm font-semibold",
              selected ? "bg-primary text-primary-foreground" : "text-foreground",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export function FilterChip({
  selected,
  children,
  onClick,
}: {
  selected?: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        "min-h-10 shrink-0 rounded-full px-3 text-sm font-semibold",
        selected ? "bg-primary text-primary-foreground" : "bg-muted text-foreground",
      )}
    >
      {children}
    </button>
  );
}

export function PullToRefresh({ onRefresh, children }: { onRefresh: () => Promise<void> | void; children: ReactNode }) {
  const startY = useRef(0);
  const [pull, setPull] = useState(0);
  const [busy, setBusy] = useState(false);

  return (
    <div
      onTouchStart={(event) => {
        if (window.scrollY <= 0) startY.current = event.touches[0]?.clientY ?? 0;
      }}
      onTouchMove={(event) => {
        if (busy || window.scrollY > 0) return;
        const dy = (event.touches[0]?.clientY ?? 0) - startY.current;
        if (dy > 0) setPull(Math.min(dy * 0.45, 72));
      }}
      onTouchEnd={() => {
        if (pull > 48 && !busy) {
          setBusy(true);
          Promise.resolve(onRefresh()).finally(() => {
            setBusy(false);
            setPull(0);
          });
        } else setPull(0);
      }}
    >
      <div className="overflow-hidden text-center type-small text-dim" style={{ height: busy ? 36 : pull }}>
        {(busy || pull > 12) && (busy ? "Refreshing…" : "Release to refresh")}
      </div>
      {children}
    </div>
  );
}

export function GuardianNote() {
  return (
    <p className="rounded-xl bg-muted px-3 py-3 type-small text-foreground">
      Messages go to the parent or guardian. Athlete phone numbers, emails, and street addresses are not shown.
      Age-gate and COPPA rules still need confirmation from SpotMyRoster counsel before a live directory is connected.
    </p>
  );
}

export function SampleLine() {
  return <p className="type-caption text-dim">Sample data on this device</p>;
}

export function coverSrc(path: string) {
  return asset(path);
}

export function IconLink({ to, label, children }: { to: string; label: string; children: ReactNode }) {
  return (
    <Link to={to as "/"} aria-label={label} className="relative flex h-11 w-11 items-center justify-center rounded-full bg-card text-foreground">
      {children}
    </Link>
  );
}

export function ProfileLink() {
  const { user } = useCoach();
  if (!user) return null;
  return (
    <Link to="/profile" aria-label="Profile" className="flex h-11 w-11 items-center justify-center">
      <PersonAvatar name={`${user.firstName} ${user.lastName}`} src={user.photoUrl} />
    </Link>
  );
}

export function HeaderActions() {
  const { data } = useCoach();
  const unread = data.notifications.filter((item) => !item.read).length;
  return (
    <div className="flex items-center gap-2">
      <IconLink to="/search" label="Search">
        <Search size={18} aria-hidden />
      </IconLink>
      <IconLink to="/notifications" label="Notifications">
        <span className="sr-only">{unread} unread</span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10 21a2 2 0 0 0 4 0" />
        </svg>
        {unread > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
            {unread}
          </span>
        )}
      </IconLink>
      <ProfileLink />
    </div>
  );
}

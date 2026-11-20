import { Link } from "@tanstack/react-router";
import { CalendarPlus, Megaphone, UserSearch } from "lucide-react";
import { useState, type ReactNode } from "react";
import { AppFrame, HeaderActions, PersonAvatar, PullToRefresh, SampleLine, SectionHead, Skeleton, StatusBadge, coverSrc } from "@/components/coach-ui";
import { greeting, shortDate, timeLabel } from "@/lib/format";
import { PIPELINE } from "@/lib/models";
import { courseProgress, useCoach } from "@/lib/store";

export function HomeScreen() {
  const { user, data } = useCoach();
  const [loading, setLoading] = useState(false);
  if (!user) return null;

  const teams = data.teams.filter((team) => !team.archived);
  const openNeeds = data.needs.filter((need) => need.status === "Open");
  const openSpots = openNeeds.reduce((sum, need) => sum + need.spots, 0);
  const newApps = data.applications.filter((item) => item.stage === "New" || item.stage === "Shortlisted");
  const upcoming = data.events
    .filter((event) => event.status === "Scheduled" && event.date >= "2026-11-20")
    .sort((a, b) => a.date.localeCompare(b.date));
  const unread = data.conversations.reduce((sum, conversation) => sum + conversation.unread, 0);
  const saved = data.athletes.filter((athlete) => athlete.saved);
  const continueCourse = data.courses.find((course) => course.enrolled && courseProgress(course) < 100) ?? data.courses[0];

  async function refresh() {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setLoading(false);
  }

  return (
    <AppFrame>
      <PullToRefresh onRefresh={refresh}>
        <div className="px-5 pt-[max(1rem,env(safe-area-inset-top))]">
          <div className="flex items-center justify-between gap-3">
            <SampleLine />
            <HeaderActions />
          </div>
          <h1 className="type-display mt-4 text-foreground">
            {greeting()}, {user.firstName}
          </h1>
          <p className="mt-1 type-body text-muted-foreground">
            {user.city}, {user.state} · {user.sports.join(", ") || "Add a sport"}
          </p>

          {loading ? (
            <div className="mt-6 space-y-3">
              <Skeleton className="h-28" />
              <Skeleton className="h-20" />
              <Skeleton className="h-24" />
            </div>
          ) : (
            <>
              <Link to="/needs" className="mt-6 block rounded-3xl bg-primary p-5 text-primary-foreground">
                <p className="type-caption text-primary-foreground/80">Roster needs</p>
                <p className="type-title mt-1">{openSpots} open {openSpots === 1 ? "spot" : "spots"}</p>
                <p className="mt-1 type-small">Across {teams.length} active {teams.length === 1 ? "team" : "teams"}</p>
              </Link>

              <Link to="/listings" className="mt-4 block rounded-2xl border border-border bg-card p-4">
                <p className="type-caption text-dim">Listings</p>
                <p className="type-sub mt-1 text-foreground">Tryouts, roster openings, and subs</p>
              </Link>
              <Link to="/coach" className="mt-2 block type-small font-semibold text-foreground underline">Coach menu</Link>

              <div className="mt-4 grid grid-cols-3 gap-2">
                <Quick to="/needs/new" icon={<Megaphone size={18} />} label="Post need" />
                <Quick to="/recruit" icon={<UserSearch size={18} />} label="Find athletes" />
                <Quick to="/events/new" icon={<CalendarPlus size={18} />} label="Create event" />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <Stat to="/needs" value={String(openNeeds.length)} label="Open needs" />
                <Stat to="/recruit/applications" value={String(newApps.length)} label="Active inquiries" />
                <Stat to="/events" value={String(upcoming.length)} label="Upcoming events" />
                <Stat to="/chat" value={String(unread)} label="Unread messages" />
              </div>

              <SectionHead title="New inquiries" action={<Link to="/recruit/applications" className="type-small font-semibold text-foreground underline">See all</Link>} />
              <div className="flex gap-3 overflow-x-auto no-scrollbar">
                {newApps.length === 0 && <p className="type-small text-muted-foreground">No new inquiries.</p>}
                {newApps.map((application) => {
                  const athlete = data.athletes.find((item) => item.id === application.athleteId);
                  const need = data.needs.find((item) => item.id === application.needId);
                  return (
                    <Link key={application.id} to="/recruit/applications/$applicationId" params={{ applicationId: application.id }} className="w-56 shrink-0 rounded-2xl border border-border bg-card p-4">
                      <StatusBadge status={application.stage} />
                      <p className="type-sub mt-3 text-foreground">{athlete?.displayName}</p>
                      <p className="type-small text-muted-foreground">{need?.positions.join(", ")} · {athlete?.city}</p>
                    </Link>
                  );
                })}
              </div>

              <SectionHead title="Upcoming" action={<Link to="/events" className="type-small font-semibold text-foreground underline">Calendar</Link>} />
              <div className="space-y-2">
                {upcoming.slice(0, 3).map((event) => (
                  <Link key={event.id} to="/events/$eventId" params={{ eventId: event.id }} className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-3">
                    <span>
                      <span className="block type-sub text-foreground">{event.title}</span>
                      <span className="type-small text-muted-foreground">{shortDate(event.date)} · {timeLabel(event.time)} · {event.city}</span>
                    </span>
                    <StatusBadge status={event.type} />
                  </Link>
                ))}
              </div>

              <SectionHead title="Pipeline" />
              <div className="grid grid-cols-4 gap-2">
                {PIPELINE.slice(0, 4).map((stage) => (
                  <Link key={stage} to="/recruit/applications" className="rounded-2xl bg-card px-2 py-3 text-center">
                    <span className="block text-lg font-semibold text-foreground">{data.applications.filter((item) => item.stage === stage).length}</span>
                    <span className="type-caption text-dim">{stage}</span>
                  </Link>
                ))}
              </div>

              <SectionHead title="Saved athletes" action={<Link to="/recruit" className="type-small font-semibold text-foreground underline">Discover</Link>} />
              <div className="space-y-2">
                {saved.map((athlete) => (
                  <Link key={athlete.id} to="/recruit/athletes/$athleteId" params={{ athleteId: athlete.id }} className="flex items-center gap-3 rounded-2xl border border-border bg-card px-3 py-3">
                    <PersonAvatar name={athlete.displayName} />
                    <span className="min-w-0 flex-1">
                      <span className="block type-sub text-foreground">{athlete.displayName}</span>
                      <span className="type-small text-muted-foreground">{athlete.positions.join(" / ")} · {athlete.ageGroup} · {athlete.miles} mi</span>
                    </span>
                  </Link>
                ))}
              </div>

              {continueCourse && (
                <>
                  <SectionHead title="Continue learning" />
                  <Link to="/learn/courses/$courseId" params={{ courseId: continueCourse.id }} className="block overflow-hidden rounded-3xl border border-border bg-card">
                    <img src={coverSrc(continueCourse.cover)} alt="" className="h-36 w-full object-cover" />
                    <div className="p-4">
                      <p className="type-sub text-foreground">{continueCourse.title}</p>
                      <p className="mt-1 type-small text-muted-foreground">{courseProgress(continueCourse)}% complete</p>
                    </div>
                  </Link>
                </>
              )}
            </>
          )}
        </div>
      </PullToRefresh>
    </AppFrame>
  );
}

function Quick({ to, icon, label }: { to: string; icon: ReactNode; label: string }) {
  return (
    <Link to={to as "/"} className="flex min-h-20 flex-col items-start justify-between rounded-2xl border border-border bg-card p-3 text-foreground">
      {icon}
      <span className="type-small font-semibold">{label}</span>
    </Link>
  );
}

function Stat({ to, value, label }: { to: string; value: string; label: string }) {
  return (
    <Link to={to as "/"} className="rounded-2xl border border-border bg-card p-4">
      <span className="block text-2xl font-semibold text-foreground">{value}</span>
      <span className="type-small text-muted-foreground">{label}</span>
    </Link>
  );
}
